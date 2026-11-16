const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const { validateCredentials } = require("../middleware/validate");

const router = express.Router();
const users = []; // in-memory users: { id, username, passwordHash }

router.post("/register", validateCredentials, async (req, res, next) => {
  try {
    const username = req.body.username.trim().toLowerCase();
    if (users.some((u) => u.username === username)) return next(Object.assign(new Error("Username already taken"), { status: 409 }));
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = { id: users.length + 1, username, passwordHash };
    users.push(user);
    res.status(201).json({ id: user.id, username });
  } catch (err) { next(err); }
});

router.post("/login", validateCredentials, async (req, res, next) => {
  try {
    const user = users.find((u) => u.username === req.body.username.trim().toLowerCase());
    const ok = user && (await bcrypt.compare(req.body.password, user.passwordHash));
    if (!ok) return next(Object.assign(new Error("Invalid username or password"), { status: 401 }));
    const token = jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) { next(err); }
});

// Protected route
router.get("/me", auth, (req, res) => res.json({ id: req.user.sub, username: req.user.username }));

module.exports = router;
