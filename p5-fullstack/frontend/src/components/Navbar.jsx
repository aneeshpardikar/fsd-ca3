import { NavLink } from "react-router-dom";

export default function Navbar() {
  const cls = ({ isActive }) => (isActive ? "active" : "");
  return (
    <nav>
      <NavLink to="/" end className={cls}>Records</NavLink>
      <NavLink to="/add" className={cls}>Add record</NavLink>
      <NavLink to="/summary" className={cls}>Summary</NavLink>
    </nav>
  );
}
