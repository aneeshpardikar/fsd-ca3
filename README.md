# Full Stack Development – Programming Exercise (Roll No. 38)

Student name: ____________________   |   B.E. (AI & DS), Semester V

| # | Folder | CO | Run |
|---|--------|----|-----|
| 1 | `p1-vanilla-js` | CO1, CO2 | `npx serve p1-vanilla-js` (or VS Code Live Server) → open the printed URL |
| 2 | `p2-react` | CO3 | `cd p2-react && npm install && npm run dev` |
| 3 | `p3-node-fs` | CO4 | `cd p3-node-fs && npm start` → http://localhost:3000 |
| 4 | `p4-express-api` | CO5 | `cd p4-express-api && npm install && cp .env.example .env && npm start` |
| 5 | `p5-fullstack` | CO6 | see below |

## Program 1 – Vanilla JS interface
- DOM manipulation: table rows built with `createElement`/`textContent`; events: submit, click, change.
- Validation: name length, numeric roll no., date required/not in future, duplicate roll no. + date.
- Fetch + async/await: `GET data/students.json`; `POST`, `PATCH` (status update) and `DELETE` go to the
  JSONPlaceholder mock API, whose JSON response is used to update the UI.
- Sorting by name/roll no./date/status (asc/desc); status cycling; error and success messages.
- Note: `fetch` of a local JSON file needs a web server (opening index.html via file:// fails).

## Program 2 – React app
Reusable components (`Navbar`, `StatusBadge`, `AttendanceForm`, `AttendanceList`), pages, props and
`useState`; `useEffect` loads and persists data (localStorage); conditional rendering (empty state,
loading, 404); React Router (`NavLink`, `Routes`, `useNavigate`).

## Program 3 – Node.js utility (no Express)
- `fs` + `path`: records in `data/attendance.json`.
- `EventEmitter`: `AttendanceStore` emits `created/updated/deleted` → console notifications + log.
- Streams: `fs.createWriteStream` (append log), `Readable → Transform → response` (CSV export), `createReadStream` (log).
- Endpoints: `GET/POST /records`, `PUT/DELETE /records/:id`, `GET /export`, `GET /log`.

```bash
curl -X POST localhost:3000/records -H "Content-Type: application/json" \
  -d '{"name":"Aarav Patil","rollNo":"101","date":"2026-11-10","status":"Present"}'
curl localhost:3000/export
```

## Program 4 – Express REST API
Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (protected),
`GET /api/attendance[?status=]`, `GET /api/attendance/:id`, `POST|PUT|DELETE` (JWT required).
Middleware: request logger, validation, JWT auth, 404 + centralized error handler. Passwords hashed with bcrypt.
Set `JWT_SECRET` in `.env` (never commit it).

## Program 5 – Full stack (React + Express + PostgreSQL/Sequelize)
**Schema** – table `Attendances`: `id` PK, `name`, `rollNo`, `date` (DATEONLY), `status` ENUM(Present/Absent/Late),
`createdAt`, `updatedAt`; unique index on (`rollNo`, `date`).
**Endpoints** – `GET/POST /api/attendance`, `PUT/DELETE /api/attendance/:id`, `GET /health`.

Local run:
```bash
# 1. PostgreSQL:  createdb attendance
cd p5-fullstack/backend && npm install && cp .env.example .env   # edit DATABASE_URL
npm start                                                         # table is created automatically
# 2. Frontend
cd ../frontend && npm install && cp .env.example .env && npm run dev   # http://localhost:5173
```
Deploy:
1. **Render (backend)** – create a PostgreSQL instance, then a Web Service (root dir `backend`, build `npm install`,
   start `npm start`). Set `DATABASE_URL` (Internal URL), `CORS_ORIGIN` (your Vercel URL), `DB_SSL=false`
   (use `true` with the External URL).
2. **Vercel (frontend)** – import the repo, root dir `frontend`, framework Vite, set `VITE_API_URL` to the Render URL.
   `vercel.json` handles React Router refreshes. Then update `CORS_ORIGIN` on Render with the final Vercel URL.

Deployment links: Frontend ______________  Backend ______________
