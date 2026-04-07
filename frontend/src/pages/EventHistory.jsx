import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { formatPerformance } from "../utils";

export default function EventHistory() {
  const { venue, eventName } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data } = await api.get(`/records/history/?event=${encodeURIComponent(eventName)}&venue=${venue}`);
        setRecords(data.results ? data.results : data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [eventName]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this record permanently?")) return;
    try {
      await api.delete(`/records/${id}/`);
      setRecords(records.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  if (loading) return <div className="loader">Loading history...</div>;

  // Compute stats
  let best = null;
  if (records.length > 0) {
    if (records[0].unit === "seconds") {
      best = [...records].sort((a, b) => a.value - b.value)[0];
    } else {
      best = [...records].sort((a, b) => b.value - a.value)[0];
    }
  }

  return (
    <div className="history-page">
      <div className="page-header flex-between align-center">
        <div>
          <Link to="/" className="back-link">← Back to Dashboard</Link>
          <h1>{eventName} ({venue}) History</h1>
        </div>
        <Link to="/add" className="btn btn-primary">+ New Entry</Link>
      </div>

      {records.length > 0 && (
        <div className="analytics-bar row mb-4">
          <div className="card flex-1 analytics-card">
            <h4>Total Entries</h4>
            <div className="analytics-value">{records.length}</div>
          </div>
          <div className="card flex-1 analytics-card">
            <h4>Current PB</h4>
            <div className="analytics-value text-primary">
              {formatPerformance(best.value, best.unit)} <span className="unit text-muted">{best.unit}</span>
            </div>
            <div className="text-small text-muted">Set on {best.date} ({best.venue})</div>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="empty-state">No records found for {eventName} ({venue}).</div>
      ) : (
        <div className="card table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Venue</th>
                <th>Performance</th>
                <th>IAAF Pts</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className={best && best.id === r.id ? "is-pb-row" : ""}>
                  <td className="date-cell">
                    {r.date} {best && best.id === r.id && <span className="pb-badge">PB</span>}
                  </td>
                  <td className="venue-cell">{r.venue}</td>
                  <td className="value-cell">
                    <strong>{formatPerformance(r.value, r.unit)}</strong> <span className="text-muted">{r.unit}</span>
                  </td>
                  <td className="points-cell">{r.iaaf_score || <span className="text-muted">—</span>}</td>
                  <td className="notes-cell">{r.notes || <span className="text-muted">—</span>}</td>
                  <td className="actions-cell">
                    <button onClick={() => handleDelete(r.id)} className="btn-icon danger" title="Delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
