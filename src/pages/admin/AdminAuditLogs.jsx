import { useEffect, useMemo, useState } from "react";
import { fetchAuditLogs } from "../../services/adminService";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const list = await fetchAuditLogs(80);
      setLogs(list);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!filter.trim()) return logs;
    return logs.filter((l) => (l.action || "").toLowerCase().includes(filter.toLowerCase()));
  }, [logs, filter]);

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">Admin</p>
          <h1 className="mt-2 font-heading text-3xl">Audit Logs</h1>
          <p className="mt-3 text-white/70">Track critical actions for compliance and debugging.</p>

          {err && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {err}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <input
              className="w-full bg-ink/60 border border-white/10 rounded-xl p-3 text-white"
              placeholder="Filter by action (e.g., CHECK_IN)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button className="gold-outline-btn" onClick={load}>Refresh</button>
          </div>

          {loading && <p className="mt-8 text-white/60">Loading…</p>}

          {!loading && (
            <div className="mt-8 space-y-4">
              {filtered.map((l) => (
                <div key={l.id} className="card-luxe p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                    {l.action || "ACTION"}
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Target: {l.targetType} / <span className="text-white/80 break-all">{l.targetId}</span>
                  </p>
                  <p className="mt-2 text-xs text-white/50">
                    Actor: {l.actorUid?.slice(0, 8)}…
                  </p>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="card-luxe p-6 text-white/70">
                  No audit logs found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
