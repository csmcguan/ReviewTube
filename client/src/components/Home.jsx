/*export default function Home({ user }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f10', color: '#f1f1f1',
      padding: '2rem'
    }}>
      <h2 style={{ marginTop: 0 }}>Welcome, {user?.name || 'User'}!</h2>
      <p>The Home feed. Currently Showing: </p>
      <ul>
        <li>Recent friend activity</li>
        <li>Latest reviews</li>
        <li>A search bar placeholder</li>
      </ul>
    </div>
  );
}*/
// src/components/Home.jsx
import { useEffect, useMemo, useState } from 'react';

const COLORS = {
  bg: '#0f0f10',
  card: '#1a1b1e',
  text: '#f1f1f1',
  dim: '#9aa1a6',
  border: '#2b2c30',
  accent: '#ff0033',
  soft: '#151619',
};


async function ytSearch(query, pageToken) {
  const key = process.env.REACT_APP_YT_API_KEY;//Youtube API Key
  if (!key) throw new Error('Missing REACT_APP_YT_API_KEY');
  const params = new URLSearchParams({
    key,
    q: query,
    part: 'snippet',
    maxResults: 8,
    type: 'video',
    ...(pageToken ? { pageToken } : {}),
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error('YouTube API error');
  return res.json();
}

export default function Home({ user }) {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [activeVideoId, setActiveVideoId] = useState(null);

  async function runSearch(reset = true) {
    if (!query.trim()) return;
    try {
      setErr('');
      setLoading(true);
      const data = await ytSearch(query, reset ? undefined : nextPage);
      const items = (data.items || []).map((it) => ({
        id: it.id.videoId,
        title: it.snippet.title,
        channel: it.snippet.channelTitle,
        thumb: it.snippet.thumbnails.medium?.url || it.snippet.thumbnails.default?.url,
        publishedAt: new Date(it.snippet.publishedAt).toLocaleDateString(),
      }));
      setVideos((v) => (reset ? items : [...v, ...items]));
      setNextPage(data.nextPageToken || null);
      if (reset && items[0]) setActiveVideoId(items[0].id);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  //Preload a demo vid search on first load, can search manually afterwards
  useEffect(() => {
    setQuery('Cinemawins Inception');
  }, []);

  useEffect(() => {
    if (query) runSearch(true);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
        <div style={layout.sideItem(false)}>Search</div>
        <div style={layout.sideItem(false)}>Review</div>
        <div style={layout.sideItem(false)}>Profile</div>
        <div style={layout.sideItem(false)}>Logout</div>

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

      {/* Main */}
      <main style={layout.main}>
        {/* Topbar */}
        <div style={layout.topbar}>
          <input
            style={layout.searchInput}
            placeholder="Search videos or channels…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => (e.key === 'Enter' ? runSearch(true) : null)}
          />
          <button onClick={() => runSearch(true)} style={layout.searchBtn}>
            {loading ? 'Searching…' : 'Search'}
          </button>
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

              {/* Player */}
              {activeVideoId && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
                    <iframe
                      title="player"
                      src={`https://www.youtube.com/embed/${activeVideoId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                    />
                  </div>
                </div>
              )}

              {/* Results */}
              <div style={layout.list}>
                {videos.map((v) => (
                  <div key={v.id} style={layout.vItem} onClick={() => setActiveVideoId(v.id)}>
                    <img src={v.thumb} alt="" style={layout.thumb} />
                    <div style={{ padding: 8 }}>
                      <h4 style={layout.metaTitle}>{v.title}</h4>
                      <div style={layout.dim}>{v.channel}</div>
                      <div style={layout.dim}>{v.publishedAt}</div>
                    </div>
                  </div>
                ))}
              </div>

              {err && <div style={{ color: '#ff6b6b', marginTop: 10 }}>{err}</div>}

              {nextPage && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => runSearch(false)} style={{ ...layout.searchBtn, background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                    {loading ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </div>

            {/* Recent Reviews placeholder */}
            <div style={{ ...layout.card, marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>Recent Reviews</h3>
              
              <ul style={{ marginTop: 8 }}>
                <li><b>Colman</b>: Interesting premise! (CinemaWins: Inception)</li>
                <li><b>Alex</b>: Great explanation! Really improved my concepts. (Intro to Mechanics)</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', color: COLORS.dim, fontSize: 12, marginTop: 10 }}>
              Alpha Prototype.
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

