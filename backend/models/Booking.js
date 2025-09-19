import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  userId: { type: String, required: true, default: 'defaultUser' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isRecurring: { type: Boolean, default: false },
  recurrenceRule: { type: String },
  exceptionDates: [{ type: Date }]
}, { timestamps: true });

bookingSchema.index({ roomId: 1, startTime: 1, endTime: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
