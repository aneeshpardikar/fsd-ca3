// Student attendance – vanilla JS (DOM, events, Fetch + async/await, JSON, HTTP methods).
// GET reads data/students.json (served locally). Write operations (POST/PUT/PATCH/DELETE)
// are sent to a public mock API (JSONPlaceholder) which echoes JSON back; the UI state is
// updated from the response so the complete request/response cycle is demonstrated.
const DATA_URL = "data/students.json";
const API_URL = "https://jsonplaceholder.typicode.com/posts";

let records = [];
let sortKey = "name";
let ascending = true;

const $ = (id) => document.getElementById(id);
const form = $("attendance-form");

function showMessage(text, type = "success") {
  const box = $("message");
  box.textContent = text;
  box.className = type;
  box.hidden = false;
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => (box.hidden = true), 5000);
}

// Generic request helper: sends JSON, checks response.ok, returns parsed JSON.
async function request(url, method = "GET", body) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`);
  return method === "DELETE" ? {} : response.json();
}

async function loadRecords() {
  $("loading").hidden = false;
  try {
    records = await request(DATA_URL);          // GET
    render();
  } catch (err) {
    showMessage(`Could not load records: ${err.message}. Serve the folder with a local web server.`, "error");
  } finally {
    $("loading").hidden = true;
  }
}

function validate({ name, rollNo, date }) {
  const errors = [];
  if (name.trim().length < 2) errors.push("Name must be at least 2 characters.");
  if (!/^\d{1,6}$/.test(rollNo.trim())) errors.push("Roll no. must be digits only.");
  if (!date) errors.push("Choose a date.");
  else if (new Date(date) > new Date()) errors.push("Date cannot be in the future.");
  if (records.some((r) => r.rollNo === rollNo.trim() && r.date === date))
    errors.push("This roll no. already has a record for that date.");
  return errors;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const entry = { name: $("name").value, rollNo: $("rollNo").value, date: $("date").value, status: $("status").value };
  ["name", "rollNo", "date"].forEach((id) => $(id).classList.remove("invalid"));
  const errors = validate(entry);
  if (errors.length) {
    if (entry.name.trim().length < 2) $("name").classList.add("invalid");
    if (!/^\d{1,6}$/.test(entry.rollNo.trim())) $("rollNo").classList.add("invalid");
    if (!entry.date) $("date").classList.add("invalid");
    return showMessage(errors.join(" "), "error");
  }
  try {
    const saved = await request(API_URL, "POST", entry);           // POST
    records.push({ ...entry, name: entry.name.trim(), rollNo: entry.rollNo.trim(), id: Date.now() + (saved.id || 0) });
    form.reset();
    render();
    showMessage("Record added.");
  } catch (err) {
    showMessage(`Could not add record: ${err.message}`, "error");
  }
});

async function cycleStatus(id) {
  const record = records.find((r) => r.id === id);
  const order = ["Present", "Absent", "Late"];
  const next = order[(order.indexOf(record.status) + 1) % order.length];
  try {
    await request(`${API_URL}/1`, "PATCH", { status: next });      // PATCH (status update)
    record.status = next;
    render();
    showMessage(`${record.name} marked ${next}.`);
  } catch (err) {
    showMessage(`Could not update status: ${err.message}`, "error");
  }
}

async function removeRecord(id) {
  if (!confirm("Delete this record?")) return;
  try {
    await request(`${API_URL}/1`, "DELETE");                       // DELETE
    records = records.filter((r) => r.id !== id);
    render();
    showMessage("Record deleted.");
  } catch (err) {
    showMessage(`Could not delete record: ${err.message}`, "error");
  }
}

function render() {
  const sorted = [...records].sort((a, b) => {
    const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true });
    return ascending ? cmp : -cmp;
  });
  const tbody = $("rows");
  tbody.innerHTML = "";
  if (!sorted.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No records yet. Add one above.</td></tr>';
  }
  for (const r of sorted) {
    const tr = document.createElement("tr");
    for (const text of [r.rollNo, r.name, r.date]) {
      const td = document.createElement("td");
      td.textContent = text;           // textContent avoids HTML injection
      tr.appendChild(td);
    }
    const statusTd = document.createElement("td");
    statusTd.innerHTML = `<span class="badge ${r.status}">${r.status}</span>`;
    const actionTd = document.createElement("td");
    const toggle = document.createElement("button");
    toggle.textContent = "Change status";
    toggle.className = "secondary";
    toggle.addEventListener("click", () => cycleStatus(r.id));
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "danger";
    del.addEventListener("click", () => removeRecord(r.id));
    actionTd.append(toggle, del);
    tr.append(statusTd, actionTd);
    tbody.appendChild(tr);
  }
  const present = records.filter((r) => r.status === "Present").length;
  $("summary").textContent = `${present} of ${records.length} present`;
}

$("sortKey").addEventListener("change", (e) => { sortKey = e.target.value; render(); });
$("sortDir").addEventListener("click", (e) => {
  ascending = !ascending;
  e.target.textContent = ascending ? "Ascending" : "Descending";
  render();
});
$("reload").addEventListener("click", loadRecords);
$("date").valueAsDate = new Date();
loadRecords();
