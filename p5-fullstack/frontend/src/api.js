const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE}/api/attendance${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection or try again shortly.");
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export const listRecords = () => request("");
export const createRecord = (body) => request("", { method: "POST", body: JSON.stringify(body) });
export const updateRecord = (id, body) => request(`/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteRecord = (id) => request(`/${id}`, { method: "DELETE" });
