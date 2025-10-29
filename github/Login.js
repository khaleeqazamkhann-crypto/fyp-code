import React, { useState } from "react";
import "./Auth.css"; 

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      alert("No user found. Please sign up first.");
      return;
    }

    if (storedUser.email === email && storedUser.password === password) {
      alert("Login successful!");
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({ name: storedUser.name || "User", email: storedUser.email })
      );
      onLoginSuccess();
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">AI Phishing Detection System</h2>
        <p className="auth-subtitle">Securely monitor and detect phishing threats</p>
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
