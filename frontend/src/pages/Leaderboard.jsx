import { useEffect, useState } from "react";
import api from "../api";
import { formatPerformance } from "../utils";

export default function Leaderboard() {
  const [eventsData, setEventsData] = useState({ Outdoors: [], Indoors: [] });
  const [activeTab, setActiveTab] = useState("Outdoors");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data } = await api.get("/events/");
        setEventsData(data);
        if (data.Outdoors && data.Outdoors.length > 0 && data.Outdoors[0][1].length > 0) {
          setSelectedEvent(data.Outdoors[0][1][0][0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const { data } = await api.get(`/leaderboard/?event=${encodeURIComponent(selectedEvent)}&venue=${activeTab}`);
        setLeaderboard(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [selectedEvent]);

  return (
    <div className="leaderboard-page">
      <header className="page-header flex-between align-center">
        <div>
          <h1>Global Leaderboard</h1>
          <p>See how you stack up against other athletes.</p>
        </div>
        <div className="card mb-4">
          <div className="row mb-4">
            <button 
              className={`btn ${activeTab === "Outdoors" ? "btn-primary" : "btn-secondary"}`} 
              onClick={() => { setActiveTab("Outdoors"); setSelectedEvent(""); setLeaderboard([]); }}
            >
              Outdoors
            </button>
            <button 
              className={`btn ${activeTab === "Indoors" ? "btn-primary" : "btn-secondary"}`} 
              onClick={() => { setActiveTab("Indoors"); setSelectedEvent(""); setLeaderboard([]); }}
            >
              Indoors
            </button>
          </div>
          <div className="form-group row align-center">
            <label className="mr-3 text-bold">Select Event:</label>
            <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="flex-1">
              <option value="">-- Choose an event --</option>
              {(eventsData[activeTab] || []).map(([groupName, events]) => (
                <optgroup key={groupName} label={groupName}>
                  {events.map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="loader">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">No records for this event yet.</div>
      ) : (
        <div className="card table-container leaderboard-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Athlete</th>
                <th>Venue</th>
                <th>Best Performance</th>
                <th>IAAF Pts</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={entry.record_id} className={idx === 0 ? "rank-1" : ""}>
                  <td className="rank-cell">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </td>
                  <td className="athlete-cell">{entry.username}</td>
                  <td className="venue-cell"><span className="text-small text-muted">{entry.venue}</span></td>
                  <td className="value-cell">
                    <strong>{formatPerformance(entry.best_value, entry.unit)}</strong>{" "}
                    <span className="text-muted">{entry.unit}</span>
                  </td>
                  <td className="points-cell">{entry.iaaf_score || <span className="text-muted">—</span>}</td>
                  <td className="date-cell">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
