// File-based record store using the fs and path modules, plus an EventEmitter for notifications.
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "attendance.json");
const LOG_FILE = path.join(DATA_DIR, "events.log");

class AttendanceStore extends EventEmitter {
  constructor() {
    super();
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
    // Stream-based logging: every event is appended to events.log.
    this.log = fs.createWriteStream(LOG_FILE, { flags: "a" });
    for (const evt of ["created", "updated", "deleted"]) {
      this.on(evt, (rec) => this.log.write(`${new Date().toISOString()} ${evt} ${JSON.stringify(rec)}\n`));
    }
  }
  all() {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
    catch (err) { throw new Error(`Could not read ${path.basename(DATA_FILE)}: ${err.message}`); }
  }
  save(list) { fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2)); }
  add({ name, rollNo, date, status }) {
    const list = this.all();
    const rec = { id: list.reduce((m, r) => Math.max(m, r.id), 0) + 1, name, rollNo, date, status };
    list.push(rec); this.save(list); this.emit("created", rec); return rec;
  }
  update(id, changes) {
    const list = this.all();
    const rec = list.find((r) => r.id === id);
    if (!rec) return null;
    Object.assign(rec, changes); this.save(list); this.emit("updated", rec); return rec;
  }
  remove(id) {
    const list = this.all();
    const rec = list.find((r) => r.id === id);
    if (!rec) return null;
    this.save(list.filter((r) => r.id !== id)); this.emit("deleted", rec); return rec;
  }
}
module.exports = { AttendanceStore, DATA_FILE, LOG_FILE };
