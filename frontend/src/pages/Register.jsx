import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.passwordConfirm);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setErrors(data);
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;
    const msgs = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
    return msgs.map((m, i) => (
      <span key={i} className="field-error">{m}</span>
    ));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🏅</div>
          <h1>Create Account</h1>
          <p>Start tracking your athletic records</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && <div className="form-error">{errors.general}</div>}
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input id="reg-username" type="text" value={form.username} onChange={set("username")} placeholder="Choose a username" required autoFocus />
            {renderError("username")}
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" required />
            {renderError("email")}
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" value={form.password} onChange={set("password")} placeholder="Create a password" required />
            {renderError("password")}
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" type="password" value={form.passwordConfirm} onChange={set("passwordConfirm")} placeholder="Confirm your password" required />
            {renderError("password_confirm")}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
