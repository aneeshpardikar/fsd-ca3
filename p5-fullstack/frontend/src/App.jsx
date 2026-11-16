import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import AddPage from "./pages/AddPage.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";
import * as api from "./api.js";

const NEXT = { Present: "Absent", Absent: "Late", Late: "Present" };

export default function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listRecords()
      .then(setRecords)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addRecord = async (values) => {
    try {
      const created = await api.createRecord(values);
      setRecords((prev) => [created, ...prev]);
      setError("");
      return true;
    } catch (e) { setError(e.message); return false; }
  };
  const cycleStatus = async (rec) => {
    try {
      const updated = await api.updateRecord(rec.id, { status: NEXT[rec.status] });
      setRecords((prev) => prev.map((r) => (r.id === rec.id ? updated : r)));
      setError("");
    } catch (e) { setError(e.message); }
  };
  const deleteRecord = async (id) => {
    try {
      await api.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setError("");
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        {error && <p className="banner error" role="alert">{error}</p>}
        {loading ? <p className="banner">Loading records…</p> : (
          <Routes>
            <Route path="/" element={<HomePage records={records} onCycle={cycleStatus} onDelete={deleteRecord} />} />
            <Route path="/add" element={<AddPage records={records} onAdd={addRecord} />} />
            <Route path="/summary" element={<SummaryPage records={records} />} />
            <Route path="*" element={<p className="banner">Page not found.</p>} />
          </Routes>
        )}
      </div>
    </>
  );
}
