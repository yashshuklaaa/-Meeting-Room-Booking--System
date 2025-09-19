import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function EditBookingModal({ booking, onClose, fetchBookings }) {
  const [form, setForm] = useState({ title: '', startTime: '', endTime: '', recurrenceRule: '' });
  const [scope, setScope] = useState('all');

  useEffect(()=>{
    if (!booking) return;
    setForm({ title: booking.title, startTime: new Date(booking.start).toISOString().slice(0,16), endTime: new Date(booking.end).toISOString().slice(0,16), recurrenceRule: booking.recurrenceRule || '' });
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = {};
      if (scope === 'instance' || scope === 'future') params.instanceDate = booking.start;
      await API.put(`/bookings/${booking.bookingId}`, { title: form.title, startTime: form.startTime, endTime: form.endTime, recurrenceRule: form.recurrenceRule }, { params: { scope: scope, instanceDate: params.instanceDate } });
      fetchBookings();
      onClose();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  }

  if (!booking) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded w-96">
        <h3 className="font-bold mb-2">Edit Booking</h3>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input value={form.title} name="title" onChange={(e)=>setForm({...form, title: e.target.value})} className="w-full border p-2 rounded" />
          <input type="datetime-local" value={form.startTime} onChange={(e)=>setForm({...form, startTime: e.target.value})} className="w-full border p-2 rounded" />
          <input type="datetime-local" value={form.endTime} onChange={(e)=>setForm({...form, endTime: e.target.value})} className="w-full border p-2 rounded" />
          {booking.isRecurring && (
            <select value={scope} onChange={(e)=>setScope(e.target.value)} className="w-full border p-2 rounded">
              <option value="all">Entire series</option>
              <option value="instance">Only this instance</option>
              <option value="future">This and future instances</option>
            </select>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
            <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Update</button>
          </div>
        </form>
      </div>
    </div>
  )
}
