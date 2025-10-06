import React, { useState } from 'react';
import './App.css';

function App() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [urls, setUrls] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, urls })
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      setResult("❌ Error connecting to backend.");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSubject('');
    setBody('');
    setUrls('');
    setResult('');
  };

  return (
    <div className="App">
      <h2>📧 Phishing Email Detector</h2>
      <form onSubmit={handleSubmit}>
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
          rows={6}
          required
        />
        <input
          type="text"
          placeholder="Email URLs (optional)"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
        <div style={{ marginTop: '1rem' }}>
          <button type="submit">Check Email</button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              marginLeft: '10px',
              backgroundColor: '#e2e8f0',
              color: '#333',
              border: '1px solid #ccc'
            }}
          >
            Reset
          </button>
        </div>
      </form>
      {loading && <p>🔄 Checking...</p>}
      {result && <h3>🔎 Result: {result}</h3>}
    </div>
  );
}

export default App;

