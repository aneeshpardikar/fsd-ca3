const express = require("express");
const Attendance = require("../models/Attendance");

const router = express.Router();
const missing = () => Object.assign(new Error("Record not found"), { status: 404 });
const pick = ({ name, rollNo, date, status }) => ({ name, rollNo, date, status });

router.get("/", async (req, res, next) => {
  try { res.json(await Attendance.findAll({ order: [["date", "DESC"], ["rollNo", "ASC"]] })); } catch (e) { next(e); }
});
router.post("/", async (req, res, next) => {
  try { res.status(201).json(await Attendance.create(pick(req.body))); } catch (e) { next(e); }
});
router.put("/:id", async (req, res, next) => {
  try {
    const rec = await Attendance.findByPk(req.params.id);
    if (!rec) throw missing();
    const changes = Object.fromEntries(Object.entries(pick(req.body)).filter(([, v]) => v !== undefined));
    res.json(await rec.update(changes));
  } catch (e) { next(e); }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const rec = await Attendance.findByPk(req.params.id);
    if (!rec) throw missing();
    await rec.destroy();
    res.status(204).end();
  } catch (e) { next(e); }
});
module.exports = router;
