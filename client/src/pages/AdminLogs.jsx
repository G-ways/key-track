import { useEffect, useState } from "react";
import api from "../api.js";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminLogs() {
  const [date, setDate] = useState(todayKey());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await api.get("/logs", { params: { date } });
      setEntries(data);
      setLoading(false);
    }
    load();
  }, [date]);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Key log</h1>
        <input
          type="date"
          className="scan-input admin-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading&hellip;</p>
      ) : entries.length === 0 ? (
        <p>No entries for this day yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry._id}>
                <td>{new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                <td>{entry.name}</td>
                <td>{entry.locationName}</td>
                <td className={entry.action === "sign-in" ? "is-in" : "is-out"}>
                  {entry.action === "sign-in" ? "Signed in" : "Signed out"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
