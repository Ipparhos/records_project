import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import AddRecord from "./pages/AddRecord";
import Dashboard from "./pages/Dashboard";
import EventHistory from "./pages/EventHistory";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { About, Privacy, Terms } from "./pages/LegalPages";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/add" element={<AddRecord />} />
              <Route path="/history/:venue/:eventName" element={<EventHistory />} />
            </Route>
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
