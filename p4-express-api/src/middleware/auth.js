const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(Object.assign(new Error("Authentication token missing"), { status: 401 }));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(Object.assign(new Error("Invalid or expired token"), { status: 401 }));
  }
};
