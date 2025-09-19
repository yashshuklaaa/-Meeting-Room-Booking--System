import Booking from '../models/Booking.js';
import pkg from 'rrule';
const { RRule, RRuleSet, rrulestr } = pkg;

import mongoose from 'mongoose';

const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  return aStart < bEnd && aEnd > bStart;
};

const hasConflict = async ({ roomId, newStart, newEnd, excludeBookingId = null }) => {
  const s = new Date(newStart);
  const e = new Date(newEnd);

  const singleQuery = {
    roomId,
    startTime: { $lt: e },
    endTime: { $gt: s }
  };
  if (excludeBookingId) singleQuery._id = { $ne: excludeBookingId };

  const conflictSingle = await Booking.findOne(singleQuery);
  if (conflictSingle) return { conflict: true, by: 'single', booking: conflictSingle };

  const recurringBookings = await Booking.find({ roomId, isRecurring: true });
  for (const rec of recurringBookings) {
    if (excludeBookingId && rec._id.equals(excludeBookingId)) continue;
    if (!rec.recurrenceRule) continue;

    const dtstart = rec.startTime.toISOString().replace(/-|:|\.\d{3}/g, '');
    const ruleText = `DTSTART:${dtstart}\n${rec.recurrenceRule}`;
    let rule;
    try {
      rule = rrulestr(ruleText);
    } catch (err) {
      continue;
    }

    const durationMs = rec.endTime.getTime() - rec.startTime.getTime();
    const bufferStart = new Date(s.getTime() - durationMs);
    const bufferEnd = new Date(e.getTime() + durationMs);

    let dates = [];
    try {
      dates = rule.between(bufferStart, bufferEnd, true);
    } catch (err) {
      dates = [];
    }

    for (const occ of dates) {
      const isException = (rec.exceptionDates || []).some(ex => new Date(ex).getTime() === new Date(occ).getTime());
      if (isException) continue;

      const occStart = new Date(occ);
      const occEnd = new Date(occStart.getTime() + durationMs);
      if (rangesOverlap(occStart, occEnd, s, e)) {
        return { conflict: true, by: 'recurring', booking: rec, occurrence: occStart };
      }
    }
  }

  return { conflict: false };
};

export const getBookings = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'start and end query params required' });

    const startDate = new Date(start);
    const endDate = new Date(end);

    const bookings = await Booking.find().populate('roomId');
    const events = [];

    bookings.forEach(booking => {
      if (booking.isRecurring && booking.recurrenceRule) {
        const dtstart = booking.startTime.toISOString().replace(/-|:|\.\d{3}/g, '');
        const ruleText = `DTSTART:${dtstart}\n${booking.recurrenceRule}`;
        let rule;
        try {
          rule = rrulestr(ruleText);
        } catch (err) {
          return;
        }

        const ruleSet = new RRuleSet();
        ruleSet.rrule(rule);

        (booking.exceptionDates || []).forEach(ex => ruleSet.exdate(new Date(ex)));

        const dates = ruleSet.between(startDate, endDate, true);
        const duration = booking.endTime.getTime() - booking.startTime.getTime();

        dates.forEach(date => {
          events.push({
            id: `${booking._id}_${date.toISOString()}`,
            bookingId: booking._id,
            title: booking.title,
            start: date,
            end: new Date(date.getTime() + duration),
            roomId: booking.roomId._id,
            roomName: booking.roomId.name,
            isRecurring: true
          });
        });
      } else {
        if (booking.startTime >= startDate && booking.endTime <= endDate) {
          events.push({
            id: booking._id.toString(),
            bookingId: booking._id,
            title: booking.title,
            start: booking.startTime,
            end: booking.endTime,
            roomId: booking.roomId._id,
            roomName: booking.roomId.name,
            isRecurring: false
          });
        }
      }
    });

    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { title, roomId, startTime, endTime, isRecurring = false, recurrenceRule } = req.body;
    if (!title || !roomId || !startTime || !endTime) return res.status(400).json({ message: 'Missing fields' });

    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);
    if (newStart >= newEnd) return res.status(400).json({ message: 'startTime must be before endTime' });

    if (!isRecurring) {
      const conflict = await hasConflict({ roomId, newStart, newEnd });
      if (conflict.conflict) return res.status(409).json({ message: 'Double booking detected', conflict });

      const newBooking = new Booking({ title, roomId, startTime: newStart, endTime: newEnd });
      await newBooking.save();
      return res.status(201).json(newBooking);
    } else {
      if (!recurrenceRule) return res.status(400).json({ message: 'recurrenceRule required for recurring bookings' });

      const dtstart = newStart.toISOString().replace(/-|:|\.\d{3}/g, '');
      const ruleText = `DTSTART:${dtstart}\n${recurrenceRule}`;
      let rule;
      try { rule = rrulestr(ruleText); } catch (err) { return res.status(400).json({ message: 'Invalid recurrenceRule' }); }

      const until = rule.options && rule.options.until ? rule.options.until : new Date(newStart.getTime() + 365 * 24 * 60 * 60 * 1000);
      const occurrences = rule.between(new Date(newStart.getTime() - 1), until, true);
      const durationMs = newEnd.getTime() - newStart.getTime();

      for (const occ of occurrences) {
        const occStart = new Date(occ);
        const occEnd = new Date(occStart.getTime() + durationMs);
        const conflict = await hasConflict({ roomId, newStart: occStart, newEnd: occEnd });
        if (conflict.conflict) return res.status(409).json({ message: 'Recurring booking conflicts existing bookings', conflict, occurrence: occStart });
      }

      const newBooking = new Booking({ title, roomId, startTime: newStart, endTime: newEnd, isRecurring: true, recurrenceRule, exceptionDates: [] });
      await newBooking.save();
      return res.status(201).json(newBooking);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, recurrenceRule } = req.body;
    const scope = req.query.scope || 'all';
    const instanceDate = req.query.instanceDate ? new Date(req.query.instanceDate) : null;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.isRecurring || scope === 'all') {
      const s = startTime ? new Date(startTime) : booking.startTime;
      const e = endTime ? new Date(endTime) : booking.endTime;
      const conflict = await hasConflict({ roomId: booking.roomId, newStart: s, newEnd: e, excludeBookingId: booking._id });
      if (conflict.conflict) return res.status(409).json({ message: 'Conflict detected', conflict });

      booking.title = title ?? booking.title;
      booking.startTime = s;
      booking.endTime = e;
      if (booking.isRecurring && recurrenceRule) booking.recurrenceRule = recurrenceRule;
      await booking.save();
      return res.status(200).json(booking);
    }

    if (scope === 'instance') {
      if (!instanceDate) return res.status(400).json({ message: 'instanceDate required' });

      booking.exceptionDates = booking.exceptionDates || [];
      booking.exceptionDates.push(instanceDate);
      await booking.save();

      const durationMs = booking.endTime.getTime() - booking.startTime.getTime();
      const newStart = startTime ? new Date(startTime) : instanceDate;
      const newEnd = endTime ? new Date(endTime) : new Date(newStart.getTime() + durationMs);

      const conflict = await hasConflict({ roomId: booking.roomId, newStart, newEnd });
      if (conflict.conflict) return res.status(409).json({ message: 'Conflict editing instance', conflict });

      const single = new Booking({ title: title ?? booking.title, roomId: booking.roomId, startTime: newStart, endTime: newEnd, isRecurring: false });
      await single.save();
      return res.status(200).json({ message: 'Instance updated', series: booking, instance: single });
    }

    if (scope === 'future') {
      if (!instanceDate) return res.status(400).json({ message: 'instanceDate required' });

      const oldRule = rrulestr(booking.recurrenceRule, { dtstart: booking.startTime });
      const oldOptions = oldRule.options;
      const untilDate = new Date(instanceDate);
      untilDate.setDate(untilDate.getDate() - 1);
      oldOptions.until = untilDate;
      const truncated = new RRule(oldOptions);
      booking.recurrenceRule = truncated.toString();
      await booking.save();

      if (!recurrenceRule) return res.status(400).json({ message: 'recurrenceRule required for new future series' });

      const newSeriesStart = startTime ? new Date(startTime) : instanceDate;
      const newSeriesEnd = endTime ? new Date(endTime) : new Date(newSeriesStart.getTime() + (booking.endTime.getTime() - booking.startTime.getTime()));

      const dtstart = newSeriesStart.toISOString().replace(/-|:|\.\d{3}/g, '');
      const ruleText = `DTSTART:${dtstart}\n${recurrenceRule}`;
      let rule;
      try { rule = rrulestr(ruleText); } catch (err) { return res.status(400).json({ message: 'Invalid recurrenceRule' }); }

      const until = rule.options && rule.options.until ? rule.options.until : new Date(newSeriesStart.getTime() + 365 * 24 * 60 * 60 * 1000);
      const occurrences = rule.between(newSeriesStart, until, true);
      const durationMs = newSeriesEnd.getTime() - newSeriesStart.getTime();

      for (const occ of occurrences) {
        const occStart = new Date(occ);
        const occEnd = new Date(occStart.getTime() + durationMs);
        const conflict = await hasConflict({ roomId: booking.roomId, newStart: occStart, newEnd: occEnd });
        if (conflict.conflict) return res.status(409).json({ message: 'Future series conflicts existing bookings', conflict, occurrence: occStart });
      }

      const newBooking = new Booking({ title: title ?? booking.title, roomId: booking.roomId, startTime: newSeriesStart, endTime: newSeriesEnd, isRecurring: true, recurrenceRule, exceptionDates: [] });
      await newBooking.save();
      return res.status(200).json({ message: 'Future updated: split done', previousSeries: booking, newSeries: newBooking });
    }

    return res.status(400).json({ message: 'Unsupported scope' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteBooking = async (req, res) => {
  const { id } = req.params;
  const { scope, instanceDate } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Invalid booking id' });

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!booking.isRecurring || scope === 'all') {
      await Booking.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Booking deleted' });
    }

    if (scope === 'instance') {
      if (!instanceDate) return res.status(400).json({ message: 'instanceDate required' });
      const ex = new Date(instanceDate);
      booking.exceptionDates = booking.exceptionDates || [];
      booking.exceptionDates.push(ex);
      await booking.save();
      return res.status(200).json({ message: 'Single instance cancelled' });
    }

    if (scope === 'future') {
      if (!instanceDate) return res.status(400).json({ message: 'instanceDate required' });
      const rule = rrulestr(booking.recurrenceRule, { dtstart: booking.startTime });
      const newOptions = rule.options;
      const untilDate = new Date(instanceDate);
      untilDate.setDate(untilDate.getDate() - 1);
      newOptions.until = untilDate;
      const newRule = new RRule(newOptions);
      booking.recurrenceRule = newRule.toString();
      await booking.save();
      return res.status(200).json({ message: 'Future instances cancelled' });
    }

    return res.status(400).json({ message: 'Invalid scope' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
