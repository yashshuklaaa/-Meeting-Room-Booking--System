import React, { useState } from 'react';
import API from '../api/api';
import EditBookingModal from './EditBookingModal';

export default function BookingsList({ bookings, fetchBookings }) {
  const [editing, setEditing] = useState(null);

  const handleDelete = async (booking) => {
    if (!window.confirm('Delete?')) return;
    try {
      if (booking.isRecurring) {
        const scope = prompt('Delete scope: all | instance | future', 'all');
        const params = { scope };
        if (scope === 'instance' || scope === 'future') params.instanceDate = booking.start;
        await API.delete(`/bookings/${booking.bookingId}`, { params });
      } else {
        await API.delete(`/bookings/${booking.bookingId}`);
      }
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-2">Bookings</h3>
      <ul className="space-y-2">
        {bookings.map(b => (
          <li key={b.id} className="p-2 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{b.title}</div>
              <div className="text-sm">{new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleString()}</div>
              <div className="text-xs">Room: {b.roomName}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(b)} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
              <button onClick={() => handleDelete(b)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {editing && <EditBookingModal booking={editing} onClose={() => setEditing(null)} fetchBookings={fetchBookings} />}
    </div>
  )
}
