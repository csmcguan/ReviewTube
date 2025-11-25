import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getFollowing } from '../services/usersApi';


const COLORS = {
  bg: '#0f0f10',
  card: '#1a1b1e',
  text: '#f1f1f1',
  dim: '#9aa1a6',
  border: '#2b2c30',
  accent: '#ff0033',
  soft: '#151619',
};

export default function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [friends, setFriends] = useState([]); 


  useEffect(() => {
  if (!user?.id) return;

  async function loadProfile() {
    try {
      // Load profile (bio) from backend
      const profile = await getProfile(user.id); // expect { bio, ... }
      setBio(profile?.bio || '');

      // Load friends/following from backend
      const following = await getFollowing(user.id); // [{ id, name }, ...]
      setFriends(following || []);
    } catch (err) {
      console.error('Failed to load profile/friends:', err);

      //  localStorage bio if backend not ready
      const key = user?.email ? `rt_profile_${user.email}` : 'rt_profile';
      const saved = localStorage.getItem(key);
      if (saved) setBio(saved);
    }
  }

  loadProfile();
}, [user?.id, user?.email]);


  function handleLogout() {
    onLogout?.();
    navigate('/');
  }

  async function handleSave() {
  if (!user?.id) return;

  setSaving(true);
  try {
    await updateProfile({ userId: user.id, bio });

    // Optional: keep local cache for faster load/fallback
    const key = user?.email ? `rt_profile_${user.email}` : 'rt_profile';
    localStorage.setItem(key, bio);

    setSavedMsg('Saved!');
  } catch (err) {
    console.error('Failed to save profile:', err);
    setSavedMsg('Failed to save');
  } finally {
    setSaving(false);
    setTimeout(() => setSavedMsg(''), 1200);
  }
}


  const layout = useMemo(() => ({
    shell: { minHeight: '100vh', background: COLORS.bg, color: COLORS.text, display: 'grid', gridTemplateColumns: '240px 1fr' },
    sidebar: { borderRight: `1px solid ${COLORS.border}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: COLORS.soft },
    sideItem: (active) => ({
      padding: '10px 12px', borderRadius: 10,
      background: active ? COLORS.card : 'transparent',
      border: `1px solid ${active ? COLORS.border : 'transparent'}`,
      cursor: 'pointer', userSelect: 'none'
    }),
    main: { padding: 16 },
    topbar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
    card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 },
    input: {
      width: '100%', padding: '10px 12px', borderRadius: 8,
      border: `1px solid ${COLORS.border}`, background: COLORS.soft, color: COLORS.text
    },
    textarea: {
      width: '100%', minHeight: 110, padding: '10px 12px', borderRadius: 8,
      border: `1px solid ${COLORS.border}`, background: COLORS.soft, color: COLORS.text, resize: 'vertical'
    },
    btnPrimary: {
      padding: '10px 16px', background: COLORS.accent, border: 'none',
      color: '#fff', fontWeight: 600, borderRadius: 8, cursor: 'pointer'
    }
  }), []);

  const [hoverHome, setHoverHome] = useState(false);
  const [hoverSearch, setHoverSearch] = useState(false);
  const [hoverReview, setHoverReview] = useState(false);
  const [hoverProfile, setHoverProfile] = useState(false);
  const [hoverLogout, setHoverLogout] = useState(false);

  return (
    <div style={layout.shell}>
      {/* Sidebar */}
      <aside style={layout.sidebar}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          ReviewTube <span style={{ color: COLORS.dim, fontSize: 12 }}>beta</span>
        </div>

        <div
          style={{ ...layout.sideItem(false), background: hoverHome ? COLORS.card : 'transparent', transition: 'background .2s' }}
          onMouseEnter={() => setHoverHome(true)} onMouseLeave={() => setHoverHome(false)} onClick={() => navigate('/home')}
          role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/home')}
        >Home</div>

        <div
          style={{ ...layout.sideItem(false), background: hoverSearch ? COLORS.card : 'transparent', transition: 'background .2s' }}
          onMouseEnter={() => setHoverSearch(true)} onMouseLeave={() => setHoverSearch(false)} onClick={() => navigate('/search')}
          role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
        >Search</div>

        <div
          style={{ ...layout.sideItem(false), background: hoverReview ? COLORS.card : 'transparent', transition: 'background .2s' }}
          onMouseEnter={() => setHoverReview(true)} onMouseLeave={() => setHoverReview(false)} onClick={() => navigate('/review')}
          role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/review')}
        >Review</div>

        <div
          style={{ ...layout.sideItem(true), background: hoverProfile ? COLORS.card : COLORS.card, transition: 'background .2s' }}
          onMouseEnter={() => setHoverProfile(true)} onMouseLeave={() => setHoverProfile(false)}
        >Profile</div>

        <div
          style={{ ...layout.sideItem(false), background: hoverLogout ? COLORS.card : 'transparent', transition: 'background .2s' }}
          onMouseEnter={() => setHoverLogout(true)} onMouseLeave={() => setHoverLogout(false)}
          onClick={handleLogout} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
        >Logout</div>

        <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: COLORS.card, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            {(user?.name || '?').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: COLORS.dim }}>{user?.email}</div>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <main style={layout.main}>
        <div style={layout.card}>
          <h3 style={{ marginTop: 0 }}>Profile</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Left: Avatar & identity with bio */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 999, background: COLORS.soft, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                  {(user?.name || 'A')[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ color: COLORS.dim, fontSize: 13 }}>{user?.email}</div>
                </div>
              </div>

              <div style={{ marginTop: 8, marginBottom: 6, color: COLORS.dim }}>Bio</div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people a bit about yourself…"
                style={layout.textarea}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <button onClick={handleSave} disabled={saving} style={layout.btnPrimary}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {savedMsg && <span style={{ color: COLORS.dim }}>{savedMsg}</span>}
              </div>
            </div>

            {/* Right: Friends */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Friends</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {friends.length ? (
                  friends.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 999, background: COLORS.soft, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                       {(f.name || f.id || 'U').charAt(0)}
                    </div>
                    <div>{f.name || f.id}</div>
                    {f.email && (
                      <div style={{ color: COLORS.dim, fontSize: 12 }}>{f.email}</div>
                    )}
                  </div>
                  ))
                ) : (
                  <div style={{color: COLORS.dim, fontSize: 13 }}>You are not following anyone yet.</div>  
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: COLORS.dim, fontSize: 12, marginTop: 10 }}>
          Alpha Prototype. Profile saved locally for now.
        </div>
      </main>
    </div>
  );
}
