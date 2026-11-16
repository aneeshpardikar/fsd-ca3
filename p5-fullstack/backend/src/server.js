require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const Attendance = require("./models/Attendance");

const app = express();
const origins = (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : false }));
app.use(express.json());
app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next(); });

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/attendance", require("./routes/attendance"));

app.use((req, res, next) => next(Object.assign(new Error("Route not found"), { status: 404 })));
// Centralized error handler: maps Sequelize errors to clean HTTP responses.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.name === "SequelizeValidationError") return res.status(400).json({ error: err.errors.map((e) => e.message).join("; ") });
  if (err.name === "SequelizeUniqueConstraintError") return res.status(409).json({ error: "A record for this roll no. and date already exists" });
  const status = err.status || (err.type === "entity.parse.failed" ? 400 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Internal server error" : err.message });
});

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    await Attendance.sync();            // creates the table if it does not exist
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
  } catch (err) {
    console.error("Could not connect to the database:", err.message);
    process.exit(1);
  }
})();
