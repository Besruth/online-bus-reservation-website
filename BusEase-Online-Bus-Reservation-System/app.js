const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = 3000;

// Update these values to match your local MySQL setup.
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "YOUR_MYSQL_PASSWORD",
  database: "busease_db",
  waitForConnections: true,
  connectionLimit: 10
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/dashboard", async (req, res) => {
  try {
    const [[passengers]] = await pool.query("SELECT COUNT(*) AS total FROM passengers");
    const [[buses]] = await pool.query("SELECT COUNT(*) AS total FROM buses WHERE status='Active'");
    const [[bookings]] = await pool.query("SELECT COUNT(*) AS total FROM bookings");
    const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total_amount),0) AS total FROM bookings WHERE booking_status='Confirmed'");
    const [recent] = await pool.query(`
      SELECT b.booking_id,b.booking_code,p.full_name,
      CONCAT(r.origin,' → ',r.destination) AS trip,
      DATE_FORMAT(b.journey_date,'%d %b %Y') AS journey_date,
      b.seats,b.total_amount,b.booking_status
      FROM bookings b JOIN passengers p ON b.passenger_id=p.passenger_id
      JOIN routes r ON b.route_id=r.route_id
      ORDER BY b.booked_at DESC LIMIT 8`);
    res.json({ passengers: passengers.total, buses: buses.total, bookings: bookings.total, revenue: Number(revenue.total), recent });
  } catch (e) { res.status(500).json({ error: "Could not load dashboard. Check MySQL settings and schema.sql." }); }
});

app.get("/api/lookup", async (req,res) => {
  try {
    const [passengers] = await pool.query("SELECT passenger_id,full_name FROM passengers ORDER BY full_name");
    const [buses] = await pool.query("SELECT bus_id,bus_number,operator_name,fare_per_seat FROM buses WHERE status='Active' ORDER BY bus_number");
    const [routes] = await pool.query("SELECT route_id,origin,destination,departure_time,arrival_time,duration FROM routes ORDER BY origin,destination");
    res.json({passengers,buses,routes});
  } catch(e) { res.status(500).json({error:"Unable to load booking options"}); }
});

app.get("/api/:resource", async (req,res) => {
  const tables = { passengers:"SELECT * FROM passengers ORDER BY passenger_id DESC", buses:"SELECT * FROM buses ORDER BY bus_id DESC", routes:"SELECT * FROM routes ORDER BY route_id DESC", bookings:`SELECT b.*,p.full_name,bus.bus_number,CONCAT(r.origin,' → ',r.destination) AS trip FROM bookings b JOIN passengers p ON b.passenger_id=p.passenger_id JOIN buses bus ON b.bus_id=bus.bus_id JOIN routes r ON b.route_id=r.route_id ORDER BY b.booking_id DESC` };
  if (!tables[req.params.resource]) return res.status(404).json({error:"Unknown resource"});
  try { const [rows] = await pool.query(tables[req.params.resource]); res.json(rows); }
  catch(e) { res.status(500).json({error:"Database request failed"}); }
});

app.post("/api/:resource", async (req,res) => {
  const { resource } = req.params, d = req.body;
  try {
    let result;
    if (resource === "passengers") {
      result = await pool.query("INSERT INTO passengers(full_name,email,phone) VALUES(?,?,?)",[d.full_name,d.email,d.phone]);
    } else if (resource === "buses") {
      result = await pool.query("INSERT INTO buses(bus_number,operator_name,bus_type,seat_capacity,fare_per_seat,status) VALUES(?,?,?,?,?,?)",[d.bus_number,d.operator_name,d.bus_type,d.seat_capacity,d.fare_per_seat,d.status || "Active"]);
    } else if (resource === "routes") {
      result = await pool.query("INSERT INTO routes(origin,destination,departure_time,arrival_time,duration) VALUES(?,?,?,?,?)",[d.origin,d.destination,d.departure_time,d.arrival_time,d.duration]);
    } else if (resource === "bookings") {
      const code = "BE-" + Math.floor(10000 + Math.random()*90000);
      const [[bus]] = await pool.query("SELECT fare_per_seat FROM buses WHERE bus_id=?",[d.bus_id]);
      if (!bus) return res.status(400).json({error:"Select a valid bus"});
      result = await pool.query("INSERT INTO bookings(booking_code,passenger_id,bus_id,route_id,journey_date,seats,total_amount,booking_status) VALUES(?,?,?,?,?,?,?,?)",[code,d.passenger_id,d.bus_id,d.route_id,d.journey_date,d.seats,Number(bus.fare_per_seat)*Number(d.seats),d.booking_status || "Confirmed"]);
    } else return res.status(404).json({error:"Unknown resource"});
    res.status(201).json({message:"Record created",id:result[0].insertId});
  } catch(e) { res.status(400).json({error:e.code === "ER_DUP_ENTRY" ? "This record already exists." : "Could not save. Check all fields and relationships."}); }
});

app.delete("/api/:resource/:id", async (req,res) => {
  const tables = {passengers:["passengers","passenger_id"],buses:["buses","bus_id"],routes:["routes","route_id"],bookings:["bookings","booking_id"]};
  const target = tables[req.params.resource];
  if (!target) return res.status(404).json({error:"Unknown resource"});
  try { await pool.query(`DELETE FROM ${target[0]} WHERE ${target[1]}=?`,[req.params.id]); res.json({message:"Deleted"}); }
  catch(e) { res.status(400).json({error:"This record is linked to a booking and cannot be deleted yet."}); }
});

app.listen(PORT, () => console.log(`BusEase running at http://localhost:${PORT}`));
