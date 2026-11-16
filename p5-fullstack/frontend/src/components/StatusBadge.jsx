// Reusable presentational component driven entirely by props.
export default function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{status}</span>;
}
