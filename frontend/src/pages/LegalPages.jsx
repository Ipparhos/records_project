import React from "react";

const LegalLayout = ({ title, children }) => (
  <div className="main-content">
    <div className="card" style={{ maxWidth: '800px', margin: '4rem auto' }}>
      <h2>{title}</h2>
      <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
        {children}
      </div>
    </div>
  </div>
);

export const About = () => (
  <LegalLayout title="About Athletics Records Dashboard">
    <p>The Athletics Records Dashboard is a personal data management tool for track and field enthusiasts. It allows users to log their performances, visualize progress, and compare results across different venues.</p>
    <p style={{ marginTop: '1rem' }}>Built with security and privacy in mind, this tool ensures your records are yours to manage.</p>
  </LegalLayout>
);

export const Privacy = () => (
  <LegalLayout title="Privacy Policy">
    <p>Your privacy is important to us. This application only stores the information you explicitly provide (account details and athletic records).</p>
    <p style={{ marginTop: '1rem' }}>We do not sell your data to third parties. All authentication is handled securely via industry-standard protocols.</p>
  </LegalLayout>
);

export const Terms = () => (
  <LegalLayout title="Terms of Service">
    <p>By using this service, you agree to provide accurate information regarding your athletic performances.</p>
    <p style={{ marginTop: '1rem' }}>This tool is provided "as is" without warranty of any kind. We reserve the right to modify or terminate the service at any time.</p>
  </LegalLayout>
);
