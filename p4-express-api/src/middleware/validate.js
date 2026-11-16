const STATUSES = ["Present", "Absent", "Late"];
const bad = (msg) => Object.assign(new Error(msg), { status: 400 });
exports.validateAttendance = (partial = false) => (req, res, next) => {
  const { name, rollNo, date, status } = req.body;
  const errors = [];
  if (!partial || name !== undefined) if (typeof name !== "string" || name.trim().length < 2) errors.push("name must be at least 2 characters");
  if (!partial || rollNo !== undefined) if (!/^\d{1,6}$/.test(String(rollNo ?? ""))) errors.push("rollNo must be digits");
  if (!partial || date !== undefined) if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) errors.push("date must be YYYY-MM-DD");
  if (!partial || status !== undefined) if (!STATUSES.includes(status)) errors.push(`status must be one of ${STATUSES.join(", ")}`);
  if (errors.length) return next(bad(errors.join("; ")));
  next();
};
exports.validateCredentials = (req, res, next) => {
  const { username, password } = req.body;
  if (typeof username !== "string" || username.trim().length < 3) return next(bad("username must be at least 3 characters"));
  if (typeof password !== "string" || password.length < 6) return next(bad("password must be at least 6 characters"));
  next();
};
