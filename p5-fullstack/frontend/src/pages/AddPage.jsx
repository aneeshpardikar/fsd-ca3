import { useNavigate } from "react-router-dom";
import AttendanceForm from "../components/AttendanceForm.jsx";

export default function AddPage({ records, onAdd }) {
  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    const ok = await onAdd(values);
    if (ok !== false) navigate("/");   // programmatic navigation after save
    return ok;
  };
  return (
    <>
      <h1>Add attendance</h1>
      <AttendanceForm onSubmit={handleSubmit} existing={records} />
    </>
  );
}
