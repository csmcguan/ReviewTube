import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { likeReview, unlikeReview } from '../services/likesApi';
import { followUser, unfollowUser, getFollowing, searchUsers } from '../services/usersApi';
import { searchMedia } from '../services/searchApi';


const COLORS = {
  bg: '#0f0f10',
  card: '#1a1b1e',
  text: '#f1f1f1',
  dim: '#9aa1a6',
  border: '#2b2c30',
  accent: '#ff0033',
  soft: '#151619',
};



const MODES = ['videos', 'channels', 'users'];

async function ytSearchVideos(query, pageToken) {
  const key = process.env.REACT_APP_YT_API_KEY;
  if (!key) throw new Error('Missing REACT_APP_YT_API_KEY');
  const params = new URLSearchParams({
    key,
    q: query,
    part: 'snippet',
    maxResults: 10,
    type: 'video',
    ...(pageToken ? { pageToken } : {}),
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error('YouTube API error');
  return res.json();
}

async function ytSearchChannels(query, pageToken) {
  const key = process.env.REACT_APP_YT_API_KEY;
  if (!key) throw new Error('Missing REACT_APP_YT_API_KEY');
  const params = new URLSearchParams({
    key,
    q: query,
    part: 'snippet',
    maxResults: 8,
    type: 'channel',
    ...(pageToken ? { pageToken } : {}),
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error('YouTube API error');
  return res.json();
}

async function ytChannelRecentVideos(channelId) {
  const key = process.env.REACT_APP_YT_API_KEY;
  if (!key) throw new Error('Missing REACT_APP_YT_API_KEY');
  const params = new URLSearchParams({
    key,
    part: 'snippet',
    maxResults: 6,
    order: 'date',
    channelId,
    type: 'video',
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error('YouTube API error');
  return res.json();
}
async function ytGetChannels(ids) {
  const key = process.env.REACT_APP_YT_API_KEY;
  const params = new URLSearchParams({
    key,
    part: 'snippet,statistics',
    id: ids.join(','),
    maxResults: 50
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`);
  if (!res.ok) throw new Error('YouTube API error (channels.list)');
  return res.json();
}

// Mock "users" & their reviews – replace with backend later
const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Alex',
    reviews: [
      { id: 'r1', title: 'Intro to Mechanics', snippet: 'Great explanation! Really improved my concepts.' },
      { id: 'r2', title: 'CinemaWins: Inception', snippet: 'Interesting premise!' },
    ],
  },
  {
    id: 'u2',
    name: 'Colman',
    reviews: [
      { id: 'r3', title: 'Computerphile: Hashing', snippet: 'Nice visual intuition.' },
    ],
  },
];

export default function Search({ user, onLogout }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState('videos');       // 'videos' | 'channels' | 'users'
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [nextPage, setNextPage] = useState(null);

  const [videoResults, setVideoResults] = useState([]);
  const [channelResults, setChannelResults] = useState([]);
  const [expanded, setExpanded] = useState({});     // channelId -> [{id,title,thumb}...]

  const [userResults, setUserResults] = useState([]); // users

  // sidebar hover states
  const [hoverHome, setHoverHome] = useState(false);
  //const [hoverSearch, setHoverSearch] = useState(false);
  const [hoverReview, setHoverReview] = useState(false);
  const [hoverProfile, setHoverProfile] = useState(false);
  const [hoverLogout, setHoverLogout] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const initialQ = params.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [likesMap, setLikesMap] = useState({});
  const [following, setFollowing] = useState([]);
  const followingIds = useMemo(
    () => following.map((f) => f.id),
    [following]
  );
  const isFollowing = (userId) => followingIds.includes(userId);

  useEffect(() => {
    async function loadFollowing() {
      if (!user?.id) return;
      try {
        const data = await getFollowing(user.id);
        setFollowing(data || []);
      } catch (err) {
        console.error('Failed to load following:', err);
      }
    }

    loadFollowing();
  }, [user?.id]);

  const likeCountFor = (id) => (likesMap[id]?.length || 0);

  const userHasLiked = (id, uid) => {
    if (!uid) return false;
    const arr = likesMap[id] || [];
    return arr.includes(uid);
  };

  async function toggleLike(reviewId) {
    if (!user?.id) return;

    const already = userHasLiked(reviewId, user.id);

    try {
      if (already) {
        await unlikeReview({ reviewId, userId: user.id });
      } else {
        await likeReview({ reviewId, userId: user.id });
      }

      // Optimistic local update
      setLikesMap((prev) => {
        const current = prev[reviewId] || [];
        let next;
        if (already) {
          next = current.filter((id) => id !== user.id);
        } else {
          next = current.includes(user.id) ? current : [...current, user.id];
        }
        return { ...prev, [reviewId]: next };
      });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  }
  async function handleToggleFollow(targetUserId, targetName) {
    if (!user?.id) return;

    const already = isFollowing(targetUserId);

    try {
      if (already) {
        await unfollowUser({ userId: user.id, targetId: targetUserId });
        setFollowing((prev) => prev.filter((f) => f.id !== targetUserId));
      } else {
        await followUser({ userId: user.id, targetId: targetUserId });
        setFollowing((prev) => [...prev, { id: targetUserId, name: targetName }]);
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  }





  useEffect(() => {
    if (initialQ) runSearch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  function handleLogout() {
    onLogout?.();
    navigate('/');
  }

  // USE BACKEND NOW
  // async function runSearch(reset = true) {
  //   if (!query.trim()) return;
  //   try {
  //     setErr('');
  //     setLoading(true);
  //     setNextPage(null);

  //     if (mode === 'videos') {
  //       const data = await ytSearchVideos(query, reset ? undefined : nextPage);
  //       const items = (data.items || []).map((it) => ({
  //         id: it.id.videoId,
  //         title: it.snippet.title,
  //         channel: it.snippet.channelTitle,
  //         thumb: it.snippet.thumbnails.medium?.url || it.snippet.thumbnails.default?.url,
  //         publishedAt: new Date(it.snippet.publishedAt).toLocaleDateString(),
  //       }));
  //       setVideoResults((v) => (reset ? items : [...v, ...items]));
  //       setNextPage(data.nextPageToken || null);
  //     } else if (mode === 'channels') {
  //       const data = await ytSearchChannels(query, reset ? undefined : nextPage);

  //       // Basic items from search.list
  //       const items = (data.items || []).map((it) => ({
  //           id: it.id.channelId,
  //           title: it.snippet.title,
  //           description: it.snippet.description,
  //       }));

  //       // Fetch full thumbnails from channels.list
  //       if (items.length) {
  //           const details = await ytGetChannels(items.map(i => i.id));
  //           const byId = new Map(
  //           (details.items || []).map(ch => [
  //               ch.id,
  //               ch.snippet?.thumbnails?.high?.url ||
  //               ch.snippet?.thumbnails?.medium?.url ||
  //               ch.snippet?.thumbnails?.default?.url ||
  //               null
  //           ])
  //           );
  //           items.forEach(i => { i.thumb = byId.get(i.id) || null; });
  //       }

  //       setChannelResults(v => (reset ? items : [...v, ...items]));
  //       setNextPage(data.nextPageToken || null);
  //     }
  //     // users mode uses mock filter only
  //   } catch (e) {
  //     setErr(e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function runSearch(reset = true) {
    if (!query.trim()) return;

    // "users" mode is purely local / mock; we don't hit the backend for that.
    if (mode === 'users') {
      return;
    }

    try {
      setErr('');
      setLoading(true);

      if (reset) {
        // new search -> reset pagination + results
        setNextPage(null);
        if (mode === 'videos') {
          setVideoResults([]);
        } else if (mode === 'channels') {
          setChannelResults([]);
        } else if (mode === 'users') {
          setUserResults([]);
        }
      }

      // search for videos
      if (mode === 'videos' || mode === 'channels') {
        const data = await searchMedia({
          query,
          type: mode,                        // 'videos' | 'channels'
          maxResults: 10,
          pageToken: reset ? undefined : nextPage,
        });

        const items = data.items || [];

        if (mode === 'videos') {
          // backend already shaped items with { id, title, channel, thumb, publishedAt }
          setVideoResults(prev => (reset ? items : [...prev, ...items]));
        } else if (mode === 'channels') {
          // backend already shaped items with { id, title, description, thumb }
          setChannelResults(prev => (reset ? items : [...prev, ...items]));
        }

        setNextPage(data.nextPageToken || null);
      } else if (mode === 'users') {  // search for users
        const users = await searchUsers({ query, maxResults: 10 });
        setUserResults(users);
        setNextPage(null);
      }
    } catch (e) {
      setErr(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  async function toggleChannelVideos(channelId) {
    if (expanded[channelId]) {
      setExpanded((m) => {
        const n = { ...m };
        delete n[channelId];
        return n;
      });
      return;
    }
    try {
      setLoading(true);
      const data = await ytChannelRecentVideos(channelId);
      const vids = (data.items || []).map((it) => ({
        id: it.id.videoId,
        title: it.snippet.title,
        thumb: it.snippet.thumbnails.medium?.url || it.snippet.thumbnails.default?.url,
      }));
      setExpanded((m) => ({ ...m, [channelId]: vids }));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // USE BACKEND
  // const filteredUsers = useMemo(() => {
  //   if (mode !== 'users') return [];
  //   const q = query.toLowerCase();
  //   return MOCK_USERS
  //     .filter((u) => u.name.toLowerCase().includes(q))
  //     .map((u) => ({
  //       ...u,
  //       reviews: u.reviews.filter(
  //         (r) =>
  //           r.title.toLowerCase().includes(q) ||
  //           r.snippet.toLowerCase().includes(q) ||
  //           u.name.toLowerCase().includes(q)
  //       ),
  //     }));
  // }, [mode, query]);
  const filteredUsers = useMemo(() => {
    if (mode !== 'users') return [];
    const q = query.toLowerCase();

    return userResults.map((u) => ({
      ...u,
      reviews: (u.reviews || []).filter((r) =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.snippet || '').toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q)
      ),
    }));
  }, [mode, query, userResults]);


  const layout = useMemo(
    () => ({
      shell: { minHeight: '100vh', background: COLORS.bg, color: COLORS.text, display: 'grid', gridTemplateColumns: '240px 1fr' },
      sidebar: { borderRight: `1px solid ${COLORS.border}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: COLORS.soft },
      sideItem: (active) => ({
        padding: '10px 12px',
        borderRadius: 10,
        background: active ? COLORS.card : 'transparent',
        border: `1px solid ${active ? COLORS.border : 'transparent'}`,
        cursor: 'pointer',
        userSelect: 'none',
      }),
      main: { padding: 16 },
      topbar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
      card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12 },
      searchRow: { display: 'flex', gap: 10, marginTop: 8 },
      searchInput: {
        flex: 1,
        background: COLORS.soft,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: '10px 12px',
        color: COLORS.text,
      },
      tabRow: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
      tabBtn: (active) => ({
        padding: '8px 12px',
        borderRadius: 8,
        border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
        background: active ? '#2a1216' : COLORS.soft,
        color: COLORS.text,
        cursor: 'pointer',
        fontWeight: active ? 700 : 500,
      }),
      btn: {
        padding: '10px 16px',
        background: COLORS.accent,
        border: 'none',
        color: '#fff',
        fontWeight: 600,
        borderRadius: 8,
        cursor: 'pointer',
      },
      list: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 },
      vItem: { display: 'flex', gap: 10, background: COLORS.soft, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' },
      thumb: { width: 160, height: 90, objectFit: 'cover' },
      metaTitle: { margin: 0, fontSize: 14, lineHeight: 1.3 },
      dim: { color: COLORS.dim, fontSize: 12 },
      reviewBtn: {
        marginTop: 6,
        padding: '6px 10px',
        borderRadius: 6,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.card,
        color: COLORS.text,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
      },
    }),
    []
  );

  return (
    <div style={layout.shell}>
      {/* Sidebar */}
      <aside style={layout.sidebar}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          ReviewTube <span style={{ color: COLORS.dim, fontSize: 12 }}>alpha</span>
        </div>

        <div
          style={{ ...layout.sideItem(false), background: hoverHome ? COLORS.card : 'transparent', transition: 'background .2s' }}
          onMouseEnter={() => setHoverHome(true)} onMouseLeave={() => setHoverHome(false)}
          onClick={() => navigate('/home')} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/home')}
        >Home</div>

        <div
          style={{ ...layout.sideItem(true), background: COLORS.card }}
        >Search</div>

        <div
          style={{ ...layout.sideItem(false), background: hoverReview ? COLORS.card : 'transparent', transition: 'background .2s' }}
          onMouseEnter={() => setHoverReview(true)} onMouseLeave={() => setHoverReview(false)}
        >Review</div>

        <div
          style={{ ...layout.sideItem(false), background: hoverProfile ? COLORS.card : 'transparent', transition: 'background .2s' }}
          onMouseEnter={() => setHoverProfile(true)} onMouseLeave={() => setHoverProfile(false)}
          onClick={() => navigate('/profile')} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
        >Profile</div>

        <div
          style={{ ...layout.sideItem(false), background: hoverLogout ? COLORS.card : 'transparent', transition: 'background .2s' }}
          onMouseEnter={() => setHoverLogout(true)} onMouseLeave={() => setHoverLogout(false)}
          onClick={handleLogout} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
        >Logout</div>

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
        {/* Top search bar */}
        <div style={layout.topbar}>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: COLORS.dim }}>
            Signed in as <b>{user?.name}</b>
          </div>
        </div>

        {/* Card with tabs and results */}
        <div style={layout.card}>
          <h3 style={{ marginTop: 0 }}>Search Videos</h3>

          {/* Mode tabs */}
          <div style={layout.tabRow}>
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setNextPage(null); }}
                style={layout.tabBtn(mode === m)}
                type="button"
              >
                {m === 'videos' ? 'Videos' : m === 'channels' ? 'Channels' : 'Users'}
              </button>
            ))}
          </div>

          {/* Input row (secondary) */}
          <div style={layout.searchRow}>
            <input
              style={layout.searchInput}
              placeholder={
                mode === 'videos'
                  ? 'Type a video title…'
                  : mode === 'channels'
                    ? 'Type a channel name…'
                    : 'Type a username…'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => (e.key === 'Enter' ? runSearch(true) : null)}
            />
            <button onClick={() => runSearch(true)} style={layout.btn} type="button">
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {/* Errors */}
          {err && <div style={{ color: '#ff6b6b', marginTop: 8 }}>{err}</div>}

          {/* Results */}
          {mode === 'videos' && (
            <>
              <div style={layout.list}>
                {videoResults.map((v) => (
                  <div key={v.id} style={layout.vItem}>
                    <img src={v.thumb} alt="" style={layout.thumb} />
                    <div style={{ padding: 8 }}>
                      <h4 style={layout.metaTitle}>{v.title}</h4>
                      <div style={layout.dim}>{v.channel}</div>
                      <div style={layout.dim}>{v.publishedAt}</div>
                      <button
                        style={layout.reviewBtn}
                        onClick={() => navigate(`/review?video=${encodeURIComponent(v.id)}`)}
                        type="button"
                      >
                        Review ▸
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {nextPage && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                  <button onClick={() => runSearch(false)} style={{ ...layout.btn, background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }} type="button">
                    {loading ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}

          {mode === 'channels' && (
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              {channelResults.map((c) => (
                <div key={c.id} style={{ ...layout.vItem, padding: 8 }}>
                  {c.thumb && <img src={c.thumb} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8 }} />}
                  <div style={{ padding: 4, flex: 1 }}>
                    <h4 style={layout.metaTitle}>{c.title}</h4>
                    <div style={{ ...layout.dim, marginTop: 4 }}>{c.description?.slice(0, 140) || ''}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        style={layout.reviewBtn}
                        onClick={() => toggleChannelVideos(c.id)}
                        type="button"
                      >
                        {expanded[c.id] ? 'Hide videos' : 'Show videos'}
                      </button>
                    </div>

                    {expanded[c.id] && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                        {expanded[c.id].map((v) => (
                          <div key={v.id} style={{ background: COLORS.soft, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
                            <img src={v.thumb} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                            <div style={{ padding: 8 }}>
                              <div style={{ ...layout.metaTitle, fontSize: 13 }}>{v.title}</div>
                              <button
                                style={{ ...layout.reviewBtn, marginTop: 6 }}
                                onClick={() => navigate(`/review?video=${encodeURIComponent(v.id)}`)}
                                type="button"
                              >
                                Review ▸
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === 'users' && (
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              {filteredUsers.map((u) => (
                <div key={u.id} style={layout.vItem}>
                  <div style={{ width: 60, display: 'grid', placeItems: 'center', fontWeight: 700, background: COLORS.card }}>
                    {u.name.charAt(0)}
                  </div>
                  <div style={{ padding: 8, flex: 1 }}>
                    <h4 style={layout.metaTitle}>{u.name}</h4>
                    <div style={{ marginTop: 4 }}>
                      <button
                        type="button"
                        style={layout.reviewBtn}
                        onClick={() => handleToggleFollow(u.id, u.name)}
                      >
                        {isFollowing(u.id) ? 'Unfollow' : 'Follow'}
                      </button>
                    </div>
                    <div style={{ ...layout.dim, marginTop: 4 }}>Recent Reviews</div>
                    <ul style={{ marginTop: 6, display: 'grid', gap: 6 }}>
                      {u.reviews.map((r) => (
                        <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                          <div>
                            <b style={{ cursor: 'pointer' }} onClick={() => navigate(`/review?view=${encodeURIComponent(r.id)}`)}>
                              {r.title}
                            </b>{' '}
                            <span style={layout.dim}>— {r.snippet}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              style={layout.reviewBtn}
                              onClick={() => navigate(`/review?view=${encodeURIComponent(r.id)}&title=${encodeURIComponent(r.title)}&snippet=${encodeURIComponent(r.snippet)}`)}
                              type="button"
                            >
                              View ▸
                            </button>
                            <button
                              style={layout.reviewBtn}
                              onClick={() => navigate(`/review?replyTo=${encodeURIComponent(r.id)}&title=${encodeURIComponent(r.title)}&snippet=${encodeURIComponent(r.snippet)}`)}
                              type="button"
                            >
                              Comment 💬
                            </button>
                            <button
                              style={layout.reviewBtn}
                              onClick={() => toggleLike(r.id)}
                              type="button"
                              title={userHasLiked(r.id, user?.id) ? 'Unlike' : 'Like'}
                            >
                              {userHasLiked(r.id, user?.id) ? '♥' : '♡'} {likeCountFor(r.id)}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {!filteredUsers.length && (
                <div style={{ color: COLORS.dim, marginTop: 8 }}>No matching users.</div>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: COLORS.dim, fontSize: 12, marginTop: 10 }}>
          Alpha Prototype.
        </div>
      </main>
    </div>
  );
}
