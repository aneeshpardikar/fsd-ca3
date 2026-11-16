const express = require("express");
const auth = require("../middleware/auth");
const { validateAttendance } = require("../middleware/validate");

const router = express.Router();
let records = [{ id: 1, name: "Aarav Patil", rollNo: "101", date: "2026-11-10", status: "Present" }];
let nextId = 2;

const find = (req) => records.find((r) => r.id === Number(req.params.id));
const missing = () => Object.assign(new Error("Record not found"), { status: 404 });

router.get("/", (req, res) => {
  const { status } = req.query;
  res.json(status ? records.filter((r) => r.status === status) : records);
});
router.get("/:id", (req, res, next) => { const r = find(req); r ? res.json(r) : next(missing()); });

// Write operations require a valid JWT.
router.post("/", auth, validateAttendance(), (req, res) => {
  const { name, rollNo, date, status } = req.body;
  const rec = { id: nextId++, name: name.trim(), rollNo: String(rollNo), date, status };
  records.push(rec);
  res.status(201).json(rec);
});
router.put("/:id", auth, validateAttendance(true), (req, res, next) => {
  const r = find(req);
  if (!r) return next(missing());
  Object.assign(r, req.body);
  res.json(r);
});
router.delete("/:id", auth, (req, res, next) => {
  const r = find(req);
  if (!r) return next(missing());
  records = records.filter((x) => x !== r);
  res.status(204).end();
});

module.exports = router;
