// Basic HTTP server (no Express). Routes:
//   GET    /records          list all
//   POST   /records          create  { name, rollNo, date, status }
//   PUT    /records/:id      update
//   DELETE /records/:id      delete
//   GET    /export           stream records as CSV (Readable -> Transform -> response)
//   GET    /log              stream the event log file to the client
const http = require("http");
const fs = require("fs");
const { Transform, Readable, pipeline } = require("stream");
const { AttendanceStore, LOG_FILE } = require("./store");

const store = new AttendanceStore();
const PORT = process.env.PORT || 3000;
const STATUSES = ["Present", "Absent", "Late"];

store.on("created", (r) => console.log(`[notify] Added ${r.name} (${r.rollNo}) – ${r.status}`));
store.on("updated", (r) => console.log(`[notify] Updated ${r.name} -> ${r.status}`));
store.on("deleted", (r) => console.log(`[notify] Deleted ${r.name}`));

const send = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; if (raw.length > 1e5) req.destroy(); });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("Invalid JSON body")); } });
    req.on("error", reject);
  });
}

function validate(b, partial = false) {
  const errors = [];
  if (!partial || b.name !== undefined) if (typeof b.name !== "string" || b.name.trim().length < 2) errors.push("name must be at least 2 characters");
  if (!partial || b.rollNo !== undefined) if (!/^\d{1,6}$/.test(String(b.rollNo ?? ""))) errors.push("rollNo must be digits");
  if (!partial || b.date !== undefined) if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date ?? "")) errors.push("date must be YYYY-MM-DD");
  if (!partial || b.status !== undefined) if (!STATUSES.includes(b.status)) errors.push(`status must be one of ${STATUSES.join(", ")}`);
  return errors;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);
  try {
    if (parts[0] === "export" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=attendance.csv" });
      const source = Readable.from([store.all()]);
      const toCsv = new Transform({
        writableObjectMode: true,
        transform(list, _enc, cb) {
          const lines = ["id,name,rollNo,date,status", ...list.map((r) => [r.id, `"${r.name}"`, r.rollNo, r.date, r.status].join(","))];
          cb(null, lines.join("\n") + "\n");
        },
      });
      return pipeline(source, toCsv, res, (err) => err && console.error("Export failed:", err.message));
    }
    if (parts[0] === "log" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return pipeline(fs.createReadStream(LOG_FILE), res, (err) => err && res.end());
    }
    if (parts[0] === "records") {
      const id = parts[1] ? Number(parts[1]) : null;
      if (req.method === "GET" && !id) return send(res, 200, store.all());
      if (req.method === "POST" && !id) {
        const body = await readBody(req);
        const errors = validate(body);
        if (errors.length) return send(res, 400, { errors });
        return send(res, 201, store.add({ ...body, name: body.name.trim(), rollNo: String(body.rollNo) }));
      }
      if (req.method === "PUT" && id) {
        const body = await readBody(req);
        const errors = validate(body, true);
        if (errors.length) return send(res, 400, { errors });
        const rec = store.update(id, body);
        return rec ? send(res, 200, rec) : send(res, 404, { error: "Record not found" });
      }
      if (req.method === "DELETE" && id) {
        return store.remove(id) ? send(res, 200, { deleted: id }) : send(res, 404, { error: "Record not found" });
      }
    }
    send(res, 404, { error: "Route not found" });
  } catch (err) {
    send(res, err.message === "Invalid JSON body" ? 400 : 500, { error: err.message });
  }
});

server.listen(PORT, () => console.log(`Attendance server running at http://localhost:${PORT}`));
