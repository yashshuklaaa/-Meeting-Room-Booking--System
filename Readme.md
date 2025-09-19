# Meeting Room Booking System

## 📝 Task Implementation Summary

### Schemas
- **Room Schema**: Stores room details such as name, capacity, and location.
- **Booking Schema**: Stores booking details including room reference, start & end time, user, and recurrence info.
- **Explanation**: The schemas are designed to prevent conflicts and allow easy management of bookings.

### Conflict Handling
- **How It Works**: Backend checks for overlapping bookings before confirming a new booking.
- **Benefit**: Ensures that no two bookings overlap for the same room, maintaining consistency and avoiding double-booking issues.

### Recurring Bookings
- **Functionality**: Supports recurring bookings (e.g., weekly team meetings).
- **Cancellation Options**:
  - Cancel a single instance.
  - Cancel all future instances.
  - Cancel the entire series.
- **Implementation**: Recurrence rules stored in the backend using proper date handling.

### Frontend Logic
- **Room Selection**: Global across the booking form for consistency.
- **Slot Click Behavior**: Clicking a time slot pre-fills the booking form with relevant info.
- **Updates & Deletions**: Any changes reflect immediately in the UI for a smooth user experience.

### Rules Followed
- No overlapping bookings.
- Cancelled slots are freed and available for new bookings.
- Modular and clean code structure for easy maintenance.

### Styling
- **Current Status**: Basic styling using Tailwind CSS.
- **Future Improvement**: Can enhance UI/UX with better styling and animations


A web-based **Meeting Room Booking System** built with **MongoDB, Node.js, Express, and React (Vite)**.  
This system allows office employees to book rooms, update or cancel bookings, and optionally handle recurring meetings. The application prevents double-booking and keeps bookings consistent across rooms.

---

## ✅ Features

- **Rooms Management**
  - Predefined rooms are seeded automatically if none exist.
  - Users can select rooms for booking.
  
- **Booking Management**
  - Create, update, and delete bookings.
  - Optional recurring bookings with rules (RRULE).
  - Cancel single instance, all future instances, or entire series of recurring bookings.
  
- **Conflict Handling**
  - Prevents overlapping bookings for the same room.
  - After cancellation, slots become available for others.

- **Frontend**
  - Select a room and day.
  - SlotGrid shows available and booked slots.
  - Clicking on a slot pre-fills the booking form.
  - Bookings list shows all existing bookings.

---

## 🗂 Project Structure



## ⚙ Setup

### Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
Install dependencies:

bash
Copy code
npm install
Create a .env file with the following content:

ini
Copy code
MONGO_URI=<Your MongoDB connection string>
PORT=5000
Start the backend server:

bash
Copy code
npm run dev
The backend server will run on http://localhost:5000.

Frontend Setup
Navigate to the frontend folder:

bash
Copy code
cd frontend
Install dependencies:

bash
Copy code
npm install
Start the Vite development server:

bash
Copy code
npm run dev

---

🔗 API Endpoints
Rooms
GET /api/rooms — Get all rooms.

Bookings
GET /api/bookings?start=YYYY-MM-DD&end=YYYY-MM-DD — Get bookings within date range.

POST /api/bookings — Create a booking.

PUT /api/bookings/:id — Update a booking.

DELETE /api/bookings/:id?scope=all|future|instance&instanceDate=YYYY-MM-DD — Delete booking(s) based on scope.

💻 Frontend Usage
RoomSelector: Select the room globally.

SlotGrid: Shows available (green) and booked (red) slots.

BookingForm: Create or update bookings. Automatically pre-fills when a slot is clicked.

BookingsList: Displays all bookings and allows deletion/updating.





Recurring booking rules use RRULE format (FREQ=WEEKLY;COUNT=10).

✅ Conclusion
This project fully implements the task described:

"Build a Meeting Room Booking System with MongoDB, Node.js + Express, React. Must handle double-booking, cancellations, updates, optional recurring bookings, and show slots per room.