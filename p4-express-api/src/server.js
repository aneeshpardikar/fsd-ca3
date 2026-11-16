require("dotenv").config();
const express = require("express");
const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");

if (!process.env.JWT_SECRET) { console.error("JWT_SECRET is not set. Copy .env.example to .env."); process.exit(1); }

const app = express();
app.use(express.json());
app.use(logger);
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/attendance", require("./routes/attendance"));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
