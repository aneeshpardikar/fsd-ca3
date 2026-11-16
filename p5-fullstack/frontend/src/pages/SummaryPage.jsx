export default function SummaryPage({ records }) {
  const count = (s) => records.filter((r) => r.status === s).length;
  const pct = records.length ? Math.round((count("Present") / records.length) * 100) : 0;
  return (
    <>
      <h1>Summary</h1>
      <div className="stats">
        <div className="stat"><strong>{records.length}</strong>Total records</div>
        <div className="stat"><strong>{count("Present")}</strong>Present</div>
        <div className="stat"><strong>{count("Absent")}</strong>Absent</div>
        <div className="stat"><strong>{count("Late")}</strong>Late</div>
        <div className="stat"><strong>{pct}%</strong>Attendance rate</div>
      </div>
    </>
  );
}
