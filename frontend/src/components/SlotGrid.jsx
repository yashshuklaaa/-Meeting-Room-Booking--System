import React from 'react';

const generateSlots = (day) => {
  const slots = [];
  const date = new Date(day);
  date.setHours(8, 0, 0, 0);
  const end = new Date(day);
  end.setHours(20, 0, 0, 0);
  while (date < end) {
    const start = new Date(date);
    const finish = new Date(date.getTime() + 30 * 60000);
    slots.push({ start, end: finish });
    date.setTime(finish.getTime());
  }
  return slots;
}

export default function SlotGrid({ selectedDay, roomId, bookings, fetchBookings }) {
  const slots = generateSlots(selectedDay);
  const roomBookings = bookings.filter(b => b.roomId === roomId);

  const isSlotBooked = (slot) => {
    return roomBookings.some(b => new Date(b.start) < slot.end && new Date(b.end) > slot.start);
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-bold mb-2">Slots for {selectedDay.toDateString()}</h3>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((s, i) => (
          <div key={i} className={`p-2 rounded border ${isSlotBooked(s) ? 'bg-red-200 text-gray-600' : 'bg-green-50'}`}>
            <div className="text-sm">{s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {s.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs mt-1">{isSlotBooked(s) ? 'Booked' : 'Available'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
