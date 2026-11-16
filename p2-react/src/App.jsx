import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import AddPage from "./pages/AddPage.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";

const STORAGE_KEY = "attendance-records";
const SAMPLE = [
  { id: 1, name: "Aarav Patil", rollNo: "101", date: "2026-11-10", status: "Present" },
  { id: 2, name: "Diya Sharma", rollNo: "102", date: "2026-11-10", status: "Absent" },
];
const NEXT = { Present: "Absent", Absent: "Late", Late: "Present" };

export default function App() {
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // useEffect #1: load once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setRecords(saved ? JSON.parse(saved) : SAMPLE);
    } catch {
      setRecords(SAMPLE);
    }
    setLoaded(true);
  }, []);

  // useEffect #2: persist whenever records change
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records, loaded]);

  const addRecord = async (values) => {
    setRecords((prev) => [...prev, { ...values, id: Date.now() }]);
    return true;
  };
  const cycleStatus = (rec) =>
    setRecords((prev) => prev.map((r) => (r.id === rec.id ? { ...r, status: NEXT[r.status] } : r)));
  const deleteRecord = (id) => setRecords((prev) => prev.filter((r) => r.id !== id));

  if (!loaded) return <p className="banner">Loading…</p>;

  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage records={records} onCycle={cycleStatus} onDelete={deleteRecord} />} />
          <Route path="/add" element={<AddPage records={records} onAdd={addRecord} />} />
          <Route path="/summary" element={<SummaryPage records={records} />} />
          <Route path="*" element={<p className="banner">Page not found.</p>} />
        </Routes>
      </div>
    </>
  );
}
