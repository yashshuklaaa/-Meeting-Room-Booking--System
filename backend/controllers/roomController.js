import Room from '../models/Room.js';

export const getRooms = async (req, res) => {
  try {
    const count = await Room.countDocuments();
    if (count === 0) {
      await Room.insertMany([
        { name: 'Conference Room A', capacity: 10 },
        { name: 'Focus Room B', capacity: 4 },
        { name: 'Boardroom', capacity: 20 }
      ]);
      console.log('Default rooms created');
    }
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
