import { useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);
const empty = { name: "", rollNo: "", date: today(), status: "Present" };

export default function AttendanceForm({ onSubmit, existing = [] }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const validate = () => {
    const found = {};
    if (values.name.trim().length < 2) found.name = "Enter at least 2 characters.";
    if (!/^\d{1,6}$/.test(values.rollNo.trim())) found.rollNo = "Roll no. must be digits only.";
    if (!values.date) found.date = "Choose a date.";
    else if (values.date > today()) found.date = "Date cannot be in the future.";
    else if (existing.some((r) => r.rollNo === values.rollNo.trim() && r.date === values.date))
      found.rollNo = "This roll no. already has a record for that date.";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    const ok = await onSubmit({ ...values, name: values.name.trim(), rollNo: values.rollNo.trim() });
    if (ok !== false) setValues(empty);
  };

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <label>Name
        <input name="name" value={values.name} onChange={handleChange} aria-invalid={!!errors.name} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>
      <label>Roll no.
        <input name="rollNo" value={values.rollNo} onChange={handleChange} inputMode="numeric" aria-invalid={!!errors.rollNo} />
        {errors.rollNo && <span className="field-error">{errors.rollNo}</span>}
      </label>
      <label>Date
        <input type="date" name="date" value={values.date} onChange={handleChange} aria-invalid={!!errors.date} />
        {errors.date && <span className="field-error">{errors.date}</span>}
      </label>
      <label>Status
        <select name="status" value={values.status} onChange={handleChange}>
          <option>Present</option><option>Absent</option><option>Late</option>
        </select>
      </label>
      <button type="submit">Save record</button>
    </form>
  );
}
