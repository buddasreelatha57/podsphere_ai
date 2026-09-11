import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container">

        <Link to="/" className="logo">
          PodSphere <span>AI</span>
        </Link>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="nav-buttons">
          <Link to="/login" className="btn-outline">
            Login
          </Link>

          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}