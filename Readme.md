# Meeting Room Booking System

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

backend/
├─ config/db.js # MongoDB connection
├─ controllers/
│ ├─ bookingController.js # CRUD and recurring logic
│ └─ roomController.js # Fetch and seed rooms
├─ models/
│ ├─ Booking.js # Booking schema
│ └─ Room.js # Room schema
├─ routes/
│ ├─ bookingRoutes.js
│ └─ roomRoutes.js
├─ server.js # Entry point
frontend/
├─ src/
│ ├─ api/api.js # Axios instance
│ ├─ components/
│ │ ├─ BookingForm.jsx
│ │ ├─ BookingsList.jsx
│ │ ├─ RoomSelector.jsx
│ │ └─ SlotGrid.jsx
│ └─ App.jsx
├─ index.html
└─ package.json

yaml
Copy code

---

## ⚙ Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
Install dependencies:

bash
Copy code
npm install
Create .env file:

ini
Copy code
MONGO_URI=<Your MongoDB connection string>
PORT=5000
Start the server:

bash
Copy code
npm run dev
The server runs on http://localhost:5000.

⚙ Frontend Setup
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
The frontend runs on http://localhost:5173 (or the port Vite shows).

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

📝 Task Implementation Summary
Schemas: Designed Room and Booking schemas in MongoDB.

Conflict Handling: Backend checks for overlapping bookings.

Recurring Bookings: Optional, supports cancelling single instance, future instances, or entire series.

Frontend Logic:

Room selection is global.

Clicking a slot pre-fills the booking form.

Updates and deletions reflect immediately.

Rules Followed:

No overlapping bookings.

Slots freed after cancellation.

Modular, clean code structure.

Styling: Basic Tailwind CSS applied. Can be improved.

📌 Notes
Login/Signup not required per task requirements.

You can enhance styling or integrate calendar libraries for better UX.

Recurring booking rules use RRULE format (FREQ=WEEKLY;COUNT=10).

✅ Conclusion
This project fully implements the task described:

"Build a Meeting Room Booking System with MongoDB, Node.js + Express, React. Must handle double-booking, cancellations, updates, optional recurring bookings, and show slots per room.