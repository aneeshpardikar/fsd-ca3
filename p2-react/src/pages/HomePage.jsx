import { useState } from "react";
import AttendanceList from "../components/AttendanceList.jsx";

export default function HomePage({ records, onCycle, onDelete }) {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? records : records.filter((r) => r.status === filter);
  return (
    <>
      <h1>Attendance records</h1>
      <label style={{ maxWidth: 200, marginBottom: 12 }}>Filter by status
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option><option>Present</option><option>Absent</option><option>Late</option>
        </select>
      </label>
      <AttendanceList records={shown} onCycle={onCycle} onDelete={onDelete} />
    </>
  );
}
