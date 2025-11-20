import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup({ onSignup }) {
  const [name, setName] = useState('');
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
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Sign up failed');
      }

      const data = await res.json();

      // Option A: auto-login after signup
      if (onSignup) onSignup(data.user);
      navigate('/home');

      // Option B (if backend doesn’t return user): navigate('/') to login instead.
      // navigate('/');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f0f10', color: '#f1f1f1', padding: '1rem' }}>
      <form onSubmit={handleSubmit}
        style={{ width: 360, background: '#1a1b1e', padding: '1.25rem', borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.35)' }}>
        <h1 style={{ margin: 0, marginBottom: 12 }}>ReviewTube</h1>
        <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 16 }}>Create your account</p>

        <label>Username</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '95%', marginTop: 6, marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #333', background: '#0b0b0c', color: '#f1f1f1' }}
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '95%', marginTop: 6, marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #333', background: '#0b0b0c', color: '#f1f1f1' }}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '95%', marginTop: 6, marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #333', background: '#0b0b0c', color: '#f1f1f1' }}
        />

        {err && <div style={{ color: '#ff6b6b', marginBottom: 10 }}>{err}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: '#ff0033', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: '#ff5c7a', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
