import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Login failed');
      }

      const data = await res.json();
      onLogin(data.user);
      navigate('/home');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: '#0f0f10', color: '#f1f1f1', padding: '1rem'
    }}>
      <form onSubmit={handleSubmit}
        style={{
          width: 360, background: '#1a1b1e', padding: '1.25rem',
          borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.35)'
        }}>
        <h1 style={{ margin: 0, marginBottom: 12 }}>ReviewTube</h1>
        <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 16 }}>Login</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: '95%', marginTop: 6, marginBottom: 12, padding: 10,
            borderRadius: 8, border: '1px solid #333', background: '#0b0b0c',
            color: '#f1f1f1'
          }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            width: '95%', marginTop: 6, marginBottom: 16, padding: 10,
            borderRadius: 8, border: '1px solid #333', background: '#0b0b0c',
            color: '#f1f1f1'
          }}
        />

        {err && <div style={{ color: '#ff6b6b', marginBottom: 10 }}>{err}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: 12, borderRadius: 10, border: 'none',
            background: '#ff0033', color: 'white', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}