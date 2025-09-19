import express from 'express';
import { getBookings, createBooking, updateBooking, deleteBooking } from '../controllers/bookingController.js';

const router = express.Router();
router.route('/').get(getBookings).post(createBooking);
router.route('/:id').put(updateBooking).delete(deleteBooking);
export default router;
