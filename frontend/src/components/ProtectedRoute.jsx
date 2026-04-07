import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="loader">Loading...</div>;
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">
            <span className="logo-icon">🏃‍♂️</span> TrackRecords
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/add" className="btn btn-primary btn-sm">+ Add Record</Link>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
