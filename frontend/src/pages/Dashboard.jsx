import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { formatPerformance } from "../utils";

export default function Dashboard() {
  const [personalBests, setPersonalBests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Outdoors");

  useEffect(() => {
    async function fetchPBs() {
      try {
        const { data } = await api.get("/records/personal-bests/");
        setPersonalBests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPBs();
  }, []);

  if (loading) return <div className="loader">Loading your records...</div>;

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <h1>Your Personal Bests</h1>
          <p>Track your athletic progress and dominate your events.</p>
        </div>
      </header>

      <div className="row" style={{ marginBottom: "1.5rem" }}>
        <button 
          className={`btn ${activeTab === "Outdoors" ? "btn-primary" : "btn-secondary"}`} 
          onClick={() => setActiveTab("Outdoors")}
        >
          Outdoors
        </button>
        <button 
          className={`btn ${activeTab === "Indoors" ? "btn-primary" : "btn-secondary"}`} 
          onClick={() => setActiveTab("Indoors")}
        >
          Indoors
        </button>
      </div>

      {personalBests.filter(pb => pb.venue === activeTab).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏅</div>
          <h3>No records yet</h3>
          <p>You haven't added any athletic records. Let's get started!</p>
          <Link to="/add" className="btn btn-primary mt-4">
            Add Your First Record
          </Link>
        </div>
      ) : (
        <div className="pb-grid mt-4">
          {personalBests.filter(pb => pb.venue === activeTab).map((pb) => (
            <Link key={`${pb.event}-${pb.venue}`} to={`/history/${pb.venue}/${encodeURIComponent(pb.event)}`} className="pb-card clickable-card">
              <div className="pb-header">
                <div className="flex-col">
                  <h3>{pb.event}</h3>
                  <span className="text-muted text-small">{pb.venue}</span>
                </div>
                <span className="date-badge">{pb.date}</span>
              </div>
              <div className="pb-value">
                {formatPerformance(pb.best_value, pb.unit)} <span className="unit">{pb.unit}</span>
              </div>
              <div className="pb-footer flex-between">
                <span>{pb.entry_count} total {pb.entry_count === 1 ? "entry" : "entries"}</span>
                <span className="text-primary">View History →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
