import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
//import { useNavigate, Link } from 'react-router-dom';



export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  useEffect(() => {
    const savedEmail = localStorage.getItem('rt_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);
  

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'Login failed');
    }
      

       const raw = data.user || {};
       const user = {
          id: raw.id,
          name: raw.username || raw.name || '',   // backend likely uses "username"
          email: raw.email || email,
        };
      onLogin(user);
      localStorage.setItem('rt_user', JSON.stringify(user)); 
      if (rememberMe) localStorage.setItem('rt_email', email);
      else localStorage.removeItem('rt_email');
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
          color: '#f1f1f1' }} 
          />

        {err && <div style={{ color: '#ff6b6b', marginBottom: 10 }}>{err}</div>}
        <label htmlFor="remember" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            style={{ accentColor: '#ff0033' }}
          />
          Remember me
        </label>
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
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14 }}>
            Don’t have an account?{' '}
            <Link to="/signup" style={{ color: '#ff5c7a', textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </div>
      </form>
    </div>
  );
}