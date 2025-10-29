import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [urls, setUrls] = useState("");
  const [emailResult, setEmailResult] = useState("");

  const [domain, setDomain] = useState("");
  const [domainResult, setDomainResult] = useState("");

  const [history, setHistory] = useState([]);

  const [realtimeEmails, setRealtimeEmails] = useState([]);
  const [latestEmail, setLatestEmail] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser({ name: "John Doe", email: "john.doe@example.com" });
  }, []);

  // ------------------ EMAIL CHECK ------------------
  const handleEmailCheck = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", {
        subject,
        body,
        urls,
      });
      setEmailResult(res.data.result);
      setHistory((prev) => [
        ...prev,
        { type: "Email", value: subject, result: res.data.result },
      ]);
    } catch {
      setEmailResult("⚠️ Error connecting to backend");
    }
  };

  // ------------------ DOMAIN CHECK ------------------
  const handleDomainCheck = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/check_domain", {
        domain,
      });
      const verdict = res.data.verdict || res.data.result;
      setDomainResult(verdict);
      setHistory((prev) => [
        ...prev,
        { type: "Website", value: domain, result: verdict },
      ]);
    } catch {
      setDomainResult("⚠️ Error connecting to backend");
    }
  };

  // ------------------ REAL-TIME EMAIL FETCH ------------------
  const fetchRealtimeEmails = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/realtime_emails");
      if (res.data && (res.data.emails || res.data.length > 0)) {
        const emails = res.data.emails || res.data;
        setRealtimeEmails(emails);

        if (emails.length > 0) {
          const lastEmail = emails[0];
          setLatestEmail(lastEmail);

          const newEntries = emails.map((email) => ({
            type: "Real-Time Email",
            value: email.subject,
            result: email.status,
          }));

          setHistory((prev) => {
            const updated = [...prev];
            newEntries.forEach((entry) => {
              if (!updated.find((h) => h.value === entry.value))
                updated.push(entry);
            });
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("❌ Error fetching real-time emails:", error);
    }
  };

  // Start real-time detection manually
  const handleStartRealtimeDetection = async () => {
    setIsListening(true);
    await fetchRealtimeEmails();
    setIsListening(false);
  };

  // ------------------ AUTO REFRESH EVERY 10 SECS ------------------
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealtimeEmails();
    }, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // ------------------ RESET FUNCTIONS ------------------
  const resetEmail = () => {
    setSubject("");
    setBody("");
    setUrls("");
    setEmailResult("");
  };

  const resetDomain = () => {
    setDomain("");
    setDomainResult("");
  };

  // ------------------ LOGOUT ------------------
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    alert("Logged out successfully!");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar" style={{ position: "relative" }}>
        <button
          className="profile-btn"
          onClick={() => setShowProfile(!showProfile)}
          style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            backgroundColor: "#222",
            color: "#fff",
            border: "none",
            padding: "8px 15px",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,255,255,0.4)",
          }}
        >
          👤 Profile
        </button>
        <h1 className="dashboard-title" style={{ textAlign: "center" }}>
          AI Powered Phishing Detection System
        </h1>
      </nav>

      {/* Main Section */}
      <div className="main-section">
        {/* Sidebar */}
        <div className="sidebar">
          <h3>📊 Overview</h3>
          <p>
            Detect potential phishing emails and malicious websites in real-time using AI.
          </p>
          <h4 style={{ marginTop: "20px", color: "white" }}>💡 How to Use</h4>
          <ol style={{ marginLeft: "-30px" }}>
            <li>Enter the email subject and body to check for phishing content.</li>
            <li>Include URLs found in the email for deeper analysis.</li>
            <li>Click “Check Email” to get an instant result.</li>
            <li>Enter a website URL to test its safety.</li>
            <li>Click “Reset” to clear inputs.</li>
          </ol>
        </div>

        {/* Email Detection */}
        <div className="card" id="home">
          <h2 style={{ textAlign: "center" }}>📧 Email Detection</h2>
          <form onSubmit={handleEmailCheck}>
            <input
              type="text"
              placeholder="Email Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <textarea
              placeholder="Email Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              required
            />
            <input
              type="text"
              placeholder="Email URLs (optional)"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
            <div className="buttons">
              <button type="submit">Check Email</button>
              <button type="button" onClick={resetEmail} className="reset-btn">
                Reset
              </button>
            </div>
          </form>
          {emailResult && <p className="result">{emailResult}</p>}
        </div>

        {/* Website Detection */}
        <div className="card">
          <h2 style={{ textAlign: "center" }}>🌐 Website Detection</h2>
          <form onSubmit={handleDomainCheck}>
            <input
              type="text"
              placeholder="Enter Website URL"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
            <div className="buttons">
              <button type="submit">Check Website</button>
              <button type="button" onClick={resetDomain} className="reset-btn">
                Reset
              </button>
            </div>
          </form>
          {domainResult && <p className="result">{domainResult}</p>}

          {/* Real-Time Detection */}
          <div className="card" style={{ marginTop: "25px" }}>
            <h2 style={{ textAlign: "center" }}>📨 Real-Time Email Detection</h2>
            <p style={{ textAlign: "center", color: "#bbb" }}>
              Monitor incoming emails and detect phishing automatically.
            </p>

            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <button
                onClick={handleStartRealtimeDetection}
                disabled={isListening}
                style={{
                  marginTop: "10px",
                  backgroundColor: isListening ? "#444" : "#00bcd4",
                  border: "none",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: isListening ? "not-allowed" : "pointer",
                  boxShadow: "0 0 10px rgba(0,255,255,0.4)",
                  transition: "0.3s",
                }}
              >
                {isListening ? "Listening for Emails..." : "Start Real-Time Detection"}
              </button>
            </div>

            {/* Latest Detected Email */}
            {latestEmail && (
              <div
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #00bcd4",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "10px",
                  boxShadow: "0 0 10px rgba(0,255,255,0.1)",
                }}
              >
                <h4 style={{ color: "#00bcd4" }}>📩 Last Detected Email:</h4>
                <p style={{ color: "#fff" }}>
                  <strong>{latestEmail.subject}</strong> →{" "}
                  <span
                    style={{
                      color: latestEmail.status.toLowerCase().includes("phish")
                        ? "#ff4d4d"
                        : "#00ff99",
                      fontWeight: "bold",
                    }}
                  >
                    {latestEmail.status}
                  </span>
                </p>
              </div>
            )}

            {/* Detected Emails List */}
            {realtimeEmails.length > 0 ? (
              <div
                style={{
                  backgroundColor: "#1e1e1e",
                  padding: "15px",
                  borderRadius: "10px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  border: "1px solid #00bcd4",
                  boxShadow: "0 0 15px rgba(0,255,255,0.2)",
                }}
              >
                <h4 style={{ color: "#00bcd4", marginBottom: "10px" }}>
                  📋 Detected Emails
                </h4>
                {realtimeEmails.map((email, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: email.status.toLowerCase().includes("phish")
                        ? "rgba(255, 77, 77, 0.15)"
                        : "rgba(0, 255, 100, 0.1)",
                      borderLeft: `4px solid ${
                        email.status.toLowerCase().includes("phish")
                          ? "#ff4d4d"
                          : "#00ff99"
                      }`,
                      padding: "10px 12px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#fff" }}>{email.subject}</strong>
                      <p style={{ margin: "3px 0", color: "#ccc", fontSize: "0.9em" }}>
                        {email.preview || "No preview available"}
                      </p>
                    </div>
                    <span
                      style={{
                        backgroundColor: email.status.toLowerCase().includes("phish")
                          ? "#ff4d4d"
                          : "#00c853",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "5px",
                        fontSize: "0.85em",
                        fontWeight: "bold",
                      }}
                    >
                      {email.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#888", marginTop: "10px" }}>
                No real-time emails detected yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detection History */}
      <div className="history-section" id="history">
        <h2>🕒 Detection History</h2>
        <div className="history-list">
          {history.length === 0 ? (
            <p>No checks yet.</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="history-item">
                <strong>{item.type}:</strong> {item.value} →{" "}
                <span>{item.result}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <h2>Things you need to Know</h2>
        <div className="about-cards">
          <div className="about-card">
            <h3>🎯 Overview</h3>
            <p>
              Our AI-powered Phishing Detection System identifies phishing emails and
              suspicious websites using advanced machine learning models trained on
              real-world datasets from Kaggle.
            </p>
          </div>

          <div className="about-card">
            <h3>⚙️ How It Works</h3>
            <p>
              - The system analyzes email content and website domains using a Random Forest model.<br />
              - It detects patterns and flags potentially malicious or unsafe links in real-time.
            </p>
          </div>

          <div className="about-card">
            <h3>💡 Features</h3>
            <p>
              - Email and Website Phishing Detection <br />
              - Real-time Classification Results <br />
              - Detection History Tracking <br />
              - Simple and Interactive User Interface
            </p>
          </div>

          <div className="about-card">
            <h3>🚀 Benefits</h3>
            <p>
              This tool helps individuals and organizations protect their data by
              identifying phishing threats before they cause harm. It's fast,
              reliable, and user-friendly.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div
          className="profile-modal"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#0d1117",
            color: "#fff",
            padding: "25px 40px",
            borderRadius: "12px",
            boxShadow: "0 0 25px rgba(0,255,255,0.3)",
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          <h2>👤 Profile</h2>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "15px",
              backgroundColor: "#ff4d4d",
              border: "none",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
