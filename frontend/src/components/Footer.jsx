import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Athletics Records Dashboard. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
