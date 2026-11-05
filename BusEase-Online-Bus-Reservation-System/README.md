# BusEase – Online Bus Reservation System

A responsive mini-project built with Node.js, Express, MySQL, HTML, CSS and JavaScript.

## Database tables
1. `passengers` – passenger contact and profile details.
2. `buses` – bus number, operator, type, capacity and fare.
3. `routes` – origin, destination, departure and arrival details.
4. `bookings` – passenger, bus, route, journey date, seats and booking status.

## Setup
1. Install Node.js and MySQL.
2. Open this folder in VS Code.
3. In MySQL Workbench, run `schema.sql`.
4. Edit the MySQL settings at the top of `app.js` (default user is `root`; set your own password).
5. In the terminal run:
   ```bash
   npm install
   npm start
   ```
6. Visit http://localhost:3000

Do not use Live Server. Open the app through the Node server.

## Notes
- The dashboard loads live counts and booking records from MySQL.
- Add passenger, bus, route and booking records from the interface.
- Sample records are inserted by `schema.sql`.
- This is an academic demonstration project; add authentication and payment-gateway integration before any real-world deployment.
