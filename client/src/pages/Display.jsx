import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import api from "../api.js";

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDay(date) {
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

export default function Display() {
  const [qr, setQr] = useState(null);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState("");

  // Tick every second for the clock.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch (or lazily create) today's token, and re-check every minute so the
  // screen quietly swaps to the new code right after midnight or on expiry.
  useEffect(() => {
    async function fetchQr() {
      try {
        const { data } = await api.get("/qr/today");
        setQr(data);
        setError("");
      } catch (err) {
        setError("Could not reach the key server. Retrying...");
      }
    }
    fetchQr();
    const id = setInterval(fetchQr, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const expiresLabel = qr
    ? new Date(qr.expiresAt).toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="station">
      <div className="station-plate">
        <p className="station-eyebrow">Key station</p>
        <h1 className="station-day">{formatDay(now)}</h1>
        <p className="station-clock">{formatClock(now)}</p>

        <div className="station-qr-frame">
          {qr ? (
            <QRCode value={qr.scanUrl} size={220} fgColor="#1E2328" bgColor="#F6F3EC" />
          ) : (
            <div className="station-qr-loading">Preparing today's code&hellip;</div>
          )}
        </div>

        <p className="station-instructions">Scan to sign a key in or out</p>
        {qr && <p className="station-expiry">This code is refreshed daily · valid until {expiresLabel}</p>}
        {error && <p className="station-error">{error}</p>}
      </div>
    </div>
  );
}
