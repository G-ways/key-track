import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api.js";

export default function ScanForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [tokenState, setTokenState] = useState("checking"); // checking | valid | invalid
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState("");
  const [action, setAction] = useState(null); // "sign-in" | "sign-out"
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { ok: bool, message: string }
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function check() {
      try {
        const { data } = await api.get(`/qr/validate/${token}`);
        setTokenState(data.valid ? "valid" : "invalid");
      } catch {
        setTokenState("invalid");
      }
    }
    if (token) check();
    else setTokenState("invalid");
  }, [token]);

  useEffect(() => {
    async function loadLocations() {
      try {
        const { data } = await api.get("/locations");
        setLocations(data);
      } catch {
        // handled implicitly - dropdown just stays empty
      }
    }
    loadLocations();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !locationId || !action) return;

    setSubmitting(true);
    setResult(null);
    try {
      await api.post("/logs", { token, name, locationId, action });
      setResult({ ok: true, message: `${action === "sign-in" ? "Signed in" : "Signed out"}. Thanks, ${name.trim()}.` });
      setName("");
      setLocationId("");
      setAction(null);
    } catch (err) {
      const message = err.response?.data?.error || "Something went wrong. Please try again.";
      setResult({ ok: false, message });
      if (err.response?.status === 410) setTokenState("invalid");
    } finally {
      setSubmitting(false);
    }
  }

  if (tokenState === "checking") {
    return (
      <div className="scan-page">
        <div className="scan-card">
          <p className="scan-status">Checking this code&hellip;</p>
        </div>
      </div>
    );
  }

  if (tokenState === "invalid") {
    return (
      <div className="scan-page">
        <div className="scan-card">
          <h1 className="scan-title">This code has expired</h1>
          <p className="scan-subtitle">
            Key codes reset every day. Please scan the code currently on display at the key station.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-page">
      <div className="scan-card">
        <p className="scan-eyebrow">Key sign in / out</p>
        <h1 className="scan-title">
          {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} ·{" "}
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </h1>

        <form onSubmit={handleSubmit} className="scan-form">
          <label className="scan-label" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            className="scan-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ama Owusu"
            required
          />

          <label className="scan-label" htmlFor="location">
            Which key
          </label>
          <select
            id="location"
            className="scan-input"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
          >
            <option value="" disabled>
              Choose a location&hellip;
            </option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>

          <span className="scan-label">Action</span>
          <div className="scan-toggle">
            <button
              type="button"
              className={`scan-toggle-btn ${action === "sign-in" ? "is-active is-in" : ""}`}
              onClick={() => setAction("sign-in")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`scan-toggle-btn ${action === "sign-out" ? "is-active is-out" : ""}`}
              onClick={() => setAction("sign-out")}
            >
              Sign out
            </button>
          </div>

          <button
            type="submit"
            className="scan-submit"
            disabled={submitting || !name.trim() || !locationId || !action}
          >
            {submitting ? "Saving…" : "Confirm"}
          </button>
        </form>

        {result && (
          <p className={`scan-result ${result.ok ? "is-ok" : "is-error"}`}>{result.message}</p>
        )}
      </div>
    </div>
  );
}
