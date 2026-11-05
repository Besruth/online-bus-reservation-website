CREATE DATABASE IF NOT EXISTS busease_db;
USE busease_db;

CREATE TABLE IF NOT EXISTS passengers (
  passenger_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buses (
  bus_id INT AUTO_INCREMENT PRIMARY KEY,
  bus_number VARCHAR(30) NOT NULL UNIQUE,
  operator_name VARCHAR(100) NOT NULL,
  bus_type VARCHAR(50) NOT NULL,
  seat_capacity INT NOT NULL,
  fare_per_seat DECIMAL(10,2) NOT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS routes (
  route_id INT AUTO_INCREMENT PRIMARY KEY,
  origin VARCHAR(80) NOT NULL,
  destination VARCHAR(80) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration VARCHAR(30) NOT NULL,
  UNIQUE KEY unique_route_time (origin, destination, departure_time)
);

CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) NOT NULL UNIQUE,
  passenger_id INT NOT NULL,
  bus_id INT NOT NULL,
  route_id INT NOT NULL,
  journey_date DATE NOT NULL,
  seats INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status ENUM('Confirmed','Pending','Cancelled') DEFAULT 'Confirmed',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_passenger FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id),
  CONSTRAINT fk_booking_route FOREIGN KEY (route_id) REFERENCES routes(route_id)
);

INSERT IGNORE INTO passengers (full_name,email,phone) VALUES
('Aarav Sharma','aarav@example.com','9876543210'),
('Ananya Reddy','ananya@example.com','9876501234'),
('Rahul Kumar','rahul@example.com','9123456780');

INSERT IGNORE INTO buses (bus_number,operator_name,bus_type,seat_capacity,fare_per_seat,status) VALUES
('AP 21 TX 4821','GreenLine Travels','AC Sleeper',36,899.00,'Active'),
('KA 05 MN 2210','SkyWay Express','Volvo Multi-Axle',40,1199.00,'Active'),
('AP 39 Z 9087','Orange Tours','Non-AC Seater',45,599.00,'Active');

INSERT IGNORE INTO routes (origin,destination,departure_time,arrival_time,duration) VALUES
('Kurnool','Hyderabad','21:30:00','05:00:00','7h 30m'),
('Hyderabad','Bengaluru','20:00:00','06:30:00','10h 30m'),
('Kurnool','Vijayawada','22:00:00','05:30:00','7h 30m');

INSERT IGNORE INTO bookings (booking_code,passenger_id,bus_id,route_id,journey_date,seats,total_amount,booking_status) VALUES
('BE-24081',1,1,1,DATE_ADD(CURDATE(), INTERVAL 2 DAY),2,1798.00,'Confirmed'),
('BE-24082',2,2,2,DATE_ADD(CURDATE(), INTERVAL 3 DAY),1,1199.00,'Pending'),
('BE-24083',3,3,3,DATE_ADD(CURDATE(), INTERVAL 5 DAY),3,1797.00,'Confirmed');
