exports.notFound = (req, res, next) => next(Object.assign(new Error(`Route ${req.method} ${req.originalUrl} not found`), { status: 404 }));
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  const status = err.status || (err.type === "entity.parse.failed" ? 400 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Internal server error" : err.message });
};
