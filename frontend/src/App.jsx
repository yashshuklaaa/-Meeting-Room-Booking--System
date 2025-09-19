import React, { useEffect, useState } from 'react';
import API from './api/api';
import RoomSelector from './components/RoomSelector';
import SlotGrid from './components/SlotGrid';
import BookingForm from './components/BookingForm';
import BookingsList from './components/BookingsList';

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());

  const fetchRooms = async () => {
    const res = await API.get('/rooms');
    setRooms(res.data);
    if (!selectedRoom && res.data.length) setSelectedRoom(res.data[0]._id);
  };

  const fetchBookings = async (start = null, end = null) => {
    const s = start || new Date();
    const e = end || (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d; })();
    const res = await API.get('/bookings', { params: { start: s.toISOString(), end: e.toISOString() } });
    setBookings(res.data);
  };

  const handleSlotClick = (hour) => {
    // Convert hour to startTime & endTime
    const start = new Date();
    start.setHours(parseInt(hour), 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    // Prefill booking form state
    setStartTime(start.toISOString().slice(0, 16)); // For input[type=datetime-local]
    setEndTime(end.toISOString().slice(0, 16));
  };

  useEffect(() => { fetchRooms(); fetchBookings(); }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <RoomSelector rooms={rooms} selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
          <BookingForm rooms={rooms} selectedRoom={selectedRoom} fetchBookings={fetchBookings} />
        </div>
        <div className="col-span-2">
          <div className="mb-4 flex items-center gap-4">
            <input type="date" value={selectedDay.toISOString().slice(0, 10)} onChange={(e) => setSelectedDay(new Date(e.target.value))} />
            <button onClick={() => fetchBookings()} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
          </div>

          <SlotGrid
            selectedDay={selectedDay}
            roomId={selectedRoom}
            bookings={bookings}
            fetchBookings={fetchBookings}

          />

          <BookingsList bookings={bookings} fetchBookings={fetchBookings} />
        </div>
      </div>
    </div>
  )
}
