import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  bg: '#0f0f10',
  card: '#1a1b1e',
  text: '#f1f1f1',
  dim: '#9aa1a6',
  border: '#2b2c30',
  accent: '#ff0033',
  soft: '#151619',
};

export default function Home({ user, onLogout }) {
  const [query, setQuery] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const [hoverLogout, setHoverLogout] = useState(false);    
  const [hoverProfile, setHoverProfile] = useState(false);
  const [hoverSearch, setHoverSearch] = useState(false);
  function readJSON(k, d) { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } }
  function writeJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  const [feed, setFeed] = useState([]); // array of reviews for the feed
  // who the user follows (mock). Backend will compute this.
 const FOLLOWED_USER_IDS = ['u1', 'u2'];       // Hardcoded followed users
 //const FOLLOWED_CHANNEL_IDS = ['UCxxxx', 'UCyyyy']; // optional future use
 const readLikes = () => readJSON('rt_likes', {});
 const writeLikes = (m) => writeJSON('rt_likes', m);
 const likeCount = (id) => (readLikes()[id] || []).length;
 const hasLiked = (id) => {
  if (!user?.id) return false;
  const arr = readLikes()[id] || [];
  return arr.includes(user.id);
 };
 function toggleLike(reviewId) {
   if (!user?.id) return;
   const map = readLikes();
   const arr = map[reviewId] || [];
   const i = arr.indexOf(user.id);
   if (i >= 0) arr.splice(i, 1); else arr.push(user.id);
   map[reviewId] = arr;
   writeLikes(map);
   // refresh counts
   setFeed(f => [...f]);
 }


 // shape of a review (local): { id, author:{id,name}, videoId, videoTitle, rating, text, createdAt }
 function seedDemoIfEmpty() {
   const current = readJSON('rt_reviews', []);
   if (current.length) return;
   const now = Date.now();
   const demo = [
     { id: 'r1', author: { id: 'u1', name: 'Alex' },   videoId: 'vid1', videoTitle: 'Intro to Mechanics',   rating: 4, text: 'Great explanation! Really improved my concepts.', createdAt: new Date(now - 1000*60*40).toISOString() },
     { id: 'r2', author: { id: 'u2', name: 'Colman' }, videoId: 'vid2', videoTitle: 'CinemaWins: Inception', rating: 5, text: 'Interesting premise!', createdAt: new Date(now - 1000*60*90).toISOString() },
   ];
   writeJSON('rt_reviews', demo);
 }
 
 useEffect(() => {
   // For backend replace with backend GET /feed
   seedDemoIfEmpty();
   const all = readJSON('rt_reviews', []);
   const filtered = all
     .filter(r => FOLLOWED_USER_IDS.includes(r.author?.id) /* || FOLLOWED_CHANNEL_IDS includes r.channelId */)
     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
   setFeed(filtered);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);


  function handleLogout() {
    if (onLogout) onLogout();
    navigate('/');                                              
  }
  const layout = useMemo(() => ({
    shell: {
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
    },
    sidebar: {
      borderRight: `1px solid ${COLORS.border}`,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      background: COLORS.soft,
    },
    sideItem: (active) => ({
      padding: '10px 12px',
      borderRadius: 10,
      background: active ? COLORS.card : 'transparent',
      border: `1px solid ${active ? COLORS.border : 'transparent'}`,
      cursor: 'pointer',
      userSelect: 'none',
    }),
    main: { padding: 16 },
    topbar: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
      position: 'sticky',
      top: 0,
      background: COLORS.bg,
      paddingBottom: 12,
      zIndex: 1,
    },
    searchInput: {
      flex: 1,
      background: COLORS.soft,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: '10px 12px',
      color: COLORS.text,
    },
    searchBtn: {
      padding: '10px 16px',
      background: COLORS.accent,
      border: 'none',
      color: '#fff',
      fontWeight: 600,
      borderRadius: 8,
      cursor: 'pointer',
    },
    grid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 },
    card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12 },
    list: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 },
    vItem: { display: 'flex', gap: 10, background: COLORS.soft, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer' },
    thumb: { width: 160, height: 90, objectFit: 'cover' },
    metaTitle: { margin: 0, fontSize: 14, lineHeight: 1.3 },
    dim: { color: COLORS.dim, fontSize: 12 },
    rightCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  }), []);

  return (
    <div style={layout.shell}>
      {/* Sidebar */}
      <aside style={layout.sidebar}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          ReviewTube <span style={{ color: COLORS.dim, fontSize: 12 }}>alpha</span>
        </div>
        <div style={layout.sideItem(true)}>Home</div>
        <div style={{ ...layout.sideItem(false), background: hoverSearch ? COLORS.card : 'transparent', transition: 'background .2s' }} onMouseEnter={() => setHoverSearch(true)} onMouseLeave={() => setHoverSearch(false)}
          onClick={() => navigate('/search')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
          >Search </div>
        <div style={layout.sideItem(false)}>Review</div>
        <div style={{...layout.sideItem(false), background: hoverProfile ? COLORS.card : 'transparent', transition: 'background 0.2s ease'}}
          onMouseEnter={() => setHoverProfile(true)}
          onMouseLeave={() => setHoverProfile(false)}
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
        >
          Profile
        </div>
        <div style={{...layout.sideItem(false),
        background: hoverLogout ? COLORS.card : 'transparent',
        transition: 'background 0.2s ease'
        }} onMouseEnter={() => setHoverLogout(true)} onMouseLeave={() => setHoverLogout(false)} onClick={handleLogout} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleLogout()}>Logout</div>

        <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: COLORS.card, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            {(user?.name || 'A')[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: COLORS.dim }}>{user?.email}</div>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <main style={layout.main}>
        {/* Topbar */}
        <div style={layout.topbar}>
          <input
            style={layout.searchInput}
            placeholder="Search videos or channels…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => (e.key === 'Enter' ? navigate(`/search?q=${encodeURIComponent(query.trim())}`) : null)}
          />
          <button
            onClick={() => navigate(`/search?q=${encodeURIComponent(query.trim())}`)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#ff0033',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}>Search</button>
          
          <div style={{ marginLeft: 'auto', fontSize: 13, color: COLORS.dim }}>
            Signed in as <b>{user?.name}</b>
          </div>
        </div>

        {/* Grid */}
        <div style={layout.grid}>
          {/* Left: feed + player */}
          <section>
            <div style={layout.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Home Feed</h3>
                <span style={{ fontSize: 12, color: COLORS.dim }}>Activity from friends</span>
              </div>
              {/* Feed of recent reviews from followed users */}
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {feed.map((r) => (
                  <div key={r.id} style={{ background: COLORS.soft, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 999, background: COLORS.card, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                        {(r.author?.name || 'A')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{r.author?.name}</div>
                        <div style={{ color: COLORS.dim, fontSize: 12 }}>
                          reviewed <b>{r.videoTitle || '(video)'}</b> • {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 8 }}>{r.text}</div>
                    <div style={{ color: COLORS.dim, fontSize: 12, marginTop: 6 }}>Rating: {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => toggleLike(r.id)}
                        style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.text, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        {hasLiked(r.id) ? '♥' : '♡'} {likeCount(r.id)}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/review?replyTo=${encodeURIComponent(r.id)}&title=${encodeURIComponent(r.videoTitle || '')}&snippet=${encodeURIComponent(r.text.slice(0, 160))}`)}
                        style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.text, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        💬 Comment
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/review?view=${encodeURIComponent(r.id)}&title=${encodeURIComponent(r.videoTitle || '')}&snippet=${encodeURIComponent(r.text.slice(0, 160))}`)}
                        style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.text, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        View ▸
                      </button>
                    </div>
                  </div>
                ))}

                {!feed.length && (
                  <div style={{ color: COLORS.dim }}>
                    No activity yet. Follow people or channels to see reviews here.
                  </div>
                )}
              </div>              
            </div>
          </section>

          {/* Right: profile/friends */}
          <aside style={layout.rightCol}>
            <div style={layout.card}>
              <h3 style={{ marginTop: 0 }}>Your Profile</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: COLORS.soft, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                  {(user?.name || 'A')[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{user?.name || 'Abyan'}</div>
                  <div style={{ color: COLORS.dim, fontSize: 13 }}>{user?.email || 'demo@reviewtube.app'}</div>
                </div>
              </div>
            </div>

            <div style={layout.card}>
              <h3 style={{ marginTop: 0 }}>Friends</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Colman', 'Alex'].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 999, background: COLORS.soft, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                      {f.charAt(0)}
                    </div>
                    <div>{f}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

