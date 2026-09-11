import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <div style={styles.iconCircle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "white" }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>
        <h2 style={styles.title}>Admin Portal</h2>
        <p style={styles.subtitle}>Sign in to manage PodSphere AI</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@podsphereai.in"
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" style={styles.button}>
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#0B0F19",
    backgroundImage: "radial-gradient(circle at center, #1E293B 0%, #0B0F19 100%)",
    color: "#ffffff",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(10px)",
    padding: "3rem",
    borderRadius: "20px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  iconCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "var(--accent)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 0 20px rgba(15, 179, 160, 0.4)",
  },
  title: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#F8FAFC",
  },
  subtitle: {
    margin: "0 0 2rem 0",
    color: "#94A3B8",
    fontSize: "0.95rem",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#FCA5A5",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    fontSize: "0.875rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    color: "#CBD5E1",
    fontWeight: 500,
  },
  input: {
    padding: "0.875rem 1rem",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  button: {
    marginTop: "0.5rem",
    padding: "1rem",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "var(--accent)",
    color: "white",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 14px 0 rgba(15, 179, 160, 0.39)",
  },
};
