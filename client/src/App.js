import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Search from './components/Search';
import Review from './components/Review';
import { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rt_user');
     return saved ? JSON.parse(saved) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login onLogin={setUser} />} />
         <Route path="/signup" element={<Signup onSignup={setUser} />} />
        <Route
          path="/home"
          element={user ? <Home user={user} onLogout={() => { setUser(null); localStorage.removeItem('rt_user'); }} /> : <Navigate to="/" replace />}
        />
         <Route
          path="/profile"
          element={user ? <Profile user={user} onLogout={() => { setUser(null); localStorage.removeItem('rt_user'); }} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/search"
          element={user ? <Search user={user} onLogout={() => { setUser(null); localStorage.removeItem('rt_user'); }} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/review"
          element={user ? <Review user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}