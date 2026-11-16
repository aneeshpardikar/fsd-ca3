import StatusBadge from "./StatusBadge.jsx";

export default function AttendanceList({ records, onCycle, onDelete }) {
  // Conditional rendering: empty state vs. table
  if (records.length === 0) return <p className="empty">No records to show. Add one from the “Add record” page.</p>;
  return (
    <table>
      <thead><tr><th>Roll no.</th><th>Name</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.id}>
            <td>{r.rollNo}</td>
            <td>{r.name}</td>
            <td>{r.date}</td>
            <td><StatusBadge status={r.status} /></td>
            <td>
              <button className="secondary" onClick={() => onCycle(r)}>Change status</button>
              <button className="danger" onClick={() => onDelete(r.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
