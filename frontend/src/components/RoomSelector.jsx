import React from 'react';
export default function RoomSelector({ rooms, selectedRoom, setSelectedRoom }) {
  return (
    <div className="mb-4 p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2">Select Room</h3>
      <select value={selectedRoom || ''} onChange={(e)=>setSelectedRoom(e.target.value)} className="w-full border p-2 rounded">
        {rooms.map(r => <option key={r._id} value={r._id}>{r.name} (cap: {r.capacity})</option>)}
      </select>
    </div>
  );
}
