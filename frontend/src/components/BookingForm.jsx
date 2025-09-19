import React, { useState, useEffect } from 'react';
import API from '../api/api';

export default function BookingForm({ rooms, selectedRoom, fetchBookings }) {
  const [form, setForm] = useState({
    title: '',
    roomId: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    recurrenceRule: ''
  });

  // Sync form.roomId with global selectedRoom whenever it changes
  useEffect(() => {
    if (selectedRoom) {
      setForm(f => ({ ...f, roomId: selectedRoom }));
    }
  }, [selectedRoom]);

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/bookings', { ...form });
      // After booking, reset form but keep the current global room selected
      setForm({
        title: '',
        roomId: selectedRoom || '',
        startTime: '',
        endTime: '',
        isRecurring: false,
        recurrenceRule: ''
      });
      fetchBookings();
      alert('Booked successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-bold mb-2">Create Booking</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />
        <select
          name="roomId"
          value={form.roomId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select room</option>
          {rooms.map(r => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="datetime-local"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isRecurring"
            checked={form.isRecurring}
            onChange={handleChange}
          />
          <label>Recurring</label>
        </div>
        {form.isRecurring && (
          <input
            name="recurrenceRule"
            value={form.recurrenceRule}
            onChange={handleChange}
            placeholder="RRULE:FREQ=WEEKLY;COUNT=10"
            className="w-full border p-2 rounded"
            required
          />
        )}
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
      </form>
    </div>
  );
}
