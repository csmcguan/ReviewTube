/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { postVideoReview, postReviewComment } from '../services/reviewsApi';
import { getVideoReviews } from '../services/reviewsApi';
import { likeReview, unlikeReview, getReviewLikes } from '../services/likesApi';



const COLORS = {
  bg: '#0f0f10',
  card: '#1a1b1e',
  text: '#f1f1f1',
  dim: '#9aa1a6',
  border: '#2b2c30',
  accent: '#ff0033',
  soft: '#151619',
};

async function ytVideoDetails(videoId) {
  const key = process.env.REACT_APP_YT_API_KEY;
  if (!key || !videoId) return null;
  const params = new URLSearchParams({
    part: 'snippet',
    id: videoId,
    key,
    maxResults: 1,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const it = data.items?.[0];
  if (!it) return null;
  return {
    id: videoId,
    title: it.snippet.title,
    channel: it.snippet.channelTitle,
    thumb: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url,
  };
}

// localStorage helpers (Edit later to use backend API)
const readJSON = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k) || '') ?? fallback; } catch { return fallback; }
};
const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export default function Review({ user, onLogout }) {
  const nav = useNavigate();
  const qs = new URLSearchParams(useLocation().search);
  const videoId = qs.get('video');       // when reviewing a video
  const replyTo = qs.get('replyTo');     // when commenting on an existing review

  const [selected, setSelected] = useState(null); // {id,title,channel,thumb}
  const [parentReview, setParentReview] = useState(null); // when replyTo set
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [comments, setComments] = useState([]);
  const viewId = qs.get('view');
  const replyToId = replyTo || viewId;
  const fallbackTitle = qs.get('title') || '';
  const fallbackSnippet = qs.get('snippet') || '';
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState(false);
  const refreshLikes = useCallback(
  async (id) => {
    if (!id) return;
    try {
      const data = await getReviewLikes(id); 
      const arr = data?.userIds || [];
      setLikes(arr);
      if (user?.id) {
        setLiked(arr.includes(user.id));
      } else {
        setLiked(false);
      }
    } catch (err) {
      console.error('Failed to load likes for review', id, err);
      setLikes([]);
      setLiked(false);
    }
  },
  [user?.id]
);

  useEffect(() => {
    (async () => {
      if (videoId) {
        const d = await ytVideoDetails(videoId);
        setSelected(d || { id: videoId });
      }
    })();
  }, [videoId]);

  useEffect(() => {
  if (!replyToId) return;

  async function loadParentFromBackend() {
    try {
      const vid = videoId || selected?.id;
      if (!vid) return;

      const all = await getVideoReviews({ videoId: vid });
      const found = all.find(r => String(r._id) === String(replyToId)); // replyToId should be Mongo _id

      setParentReview(found || null);
      setComments(loadComments(replyToId));  // still using local for comments for now
      if (replyToId) {
        await refreshLikes(replyToId);
      }

      if (found?.targetId && !videoId) {
        ytVideoDetails(found.targetId).then(d =>
          setSelected(d || { id: found.targetId })
        );
      }
    } catch (err) {
      console.error("Failed to load parent review:", err);
    }
  }

  loadParentFromBackend();
}, [replyToId, videoId, selected?.id, refreshLikes]);


  const layout = useMemo(() => ({
    shell: { minHeight: '100vh', background: COLORS.bg, color: COLORS.text, display: 'grid', gridTemplateColumns: '240px 1fr' },
    sidebar: { borderRight: `1px solid ${COLORS.border}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: COLORS.soft },
    sideItem: (active) => ({ padding: '10px 12px', borderRadius: 10, background: active ? COLORS.card : 'transparent', border: `1px solid ${active ? COLORS.border : 'transparent'}`, cursor: 'pointer' }),
    main: { padding: 16 },
    card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 },
    input: { width: '100%', background: COLORS.soft, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: '10px 12px' },
    textarea: { width: '95%', minHeight: 140, background: COLORS.soft, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: '10px 12px', resize: 'vertical' },
    btn: { padding: '10px 16px', background: COLORS.accent, border: 'none', color: '#fff', fontWeight: 600, borderRadius: 8, cursor: 'pointer' },
    reviewBtn: {padding: '6px 10px',borderRadius: 6,border: `1px solid ${COLORS.border}`,background: COLORS.card,color: COLORS.text,cursor: 'pointer',fontSize: 12,fontWeight: 600,},
  }), []);

  function handleLogout() {
    onLogout?.();
    nav('/');
  }
function loadComments(parentId) {
    const all = readJSON('rt_comments', []);
    return all
        .filter((c) => c.parentReviewId === parentId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function saveReviewOrComment() {
  const now = new Date().toISOString();
  if (replyToId) {
    // comment on an existing review
    const comments = readJSON('rt_comments', []);
    const comment = {
      id: `c_${Date.now()}`,
      parentReviewId: replyToId,
      author: { id: user?.id, name: user?.name, email: user?.email },
      text,
      createdAt: now,
    };
    comments.push(comment);
    writeJSON('rt_comments', comments);
    setComments(loadComments(replyToId));   // refresh UI
    return { ok: true, type: 'comment', id: comment.id };
  } else {
    // new review
    const reviews = readJSON('rt_reviews', []);
    const review = {
      id: `r_${Date.now()}`,
      author: { id: user?.id, name: user?.name, email: user?.email },
      videoId: selected?.id || null,
      rating,
      text,
      createdAt: now,
    };
    reviews.push(review);
    writeJSON('rt_reviews', reviews);
    return { ok: true, type: 'review', id: review.id };
  }
}

  async function toggleLike() {
  if (!replyToId || !user?.id) return;

  const already = liked;

  try {
    if (already) {
      await unlikeReview({ reviewId: replyToId, userId: user.id });
    } else {
      await likeReview({ reviewId: replyToId, userId: user.id });
    }

    // Optimistic local update
    setLikes((prev) => {
      const current = prev || [];
      let next;
      if (already) {
        next = current.filter((id) => id !== user.id);
      } else {
        next = current.includes(user.id) ? current : [...current, user.id];
      }
      return next;
    });
    setLiked(!already);
  } catch (err) {
    console.error('Failed to toggle like:', err);
  }
}


  async function handlePost() {
    if (!text.trim()) { setMsg('Please write something.'); return; }
    if (!replyTo && !selected?.id) { setMsg('Please select a video from Search first.'); return; }
    if (!user?.id) {
    setMsg('You must be logged in to post.');
    return;
  }
  setSaving(true);
  try {
    if (replyToId) {
      // Comment on existing review via backend
      const result = await postReviewComment({
        reviewId: replyToId,
        userId: user.id,
        text,
      });

      // mirror to local storage if we want to
      // const resLocal = saveReviewOrComment();

      setMsg('Comment posted!');
      setText('');
      
    } else {
      // New review via backend
      const result = await postVideoReview({
        videoId: selected?.id,
        videoTitle: selected?.title,
        userId: user.id,
        rating,
        text,
      });

      setMsg('Review posted!');
      setText('');
    }

    setTimeout(() => setMsg(''), 1200);
  } catch (err) {
    console.error(err);
    setMsg('Failed to post.');
  } finally {
    setSaving(false);
  }
  }

  // Sidebar hover states (just Home/Profile/Logout clickable here)
  const [hHome, setHHome] = useState(false);
  const [hProfile, setHProfile] = useState(false);
  const [hLogout, setHLogout] = useState(false);
  const [hSearch, setHSearch] = useState(false);

  return (
    <div style={layout.shell}>
      {/* Sidebar */}
      <aside style={layout.sidebar}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          ReviewTube <span style={{ color: COLORS.dim, fontSize: 12 }}>beta</span>
        </div>

        <div style={{ ...layout.sideItem(false), background: hHome ? COLORS.card : 'transparent', transition: 'background .2s' }}
             onMouseEnter={() => setHHome(true)} onMouseLeave={() => setHHome(false)}
             onClick={() => nav('/home')} role="button" tabIndex={0}
             onKeyDown={(e) => e.key === 'Enter' && nav('/home')}>Home</div>

        <div style={{ ...layout.sideItem(false), background: hSearch ? COLORS.card : 'transparent', transition: 'background .2s' }}
             onMouseEnter={() => setHSearch(true)} onMouseLeave={() => setHSearch(false)}
             onClick={() => nav('/search')} role="button" tabIndex={0}
             onKeyDown={(e) => e.key === 'Enter' && nav('/search')}>Search</div>

        <div style={{ ...layout.sideItem(true), background: COLORS.card }}>Review</div>

        <div style={{ ...layout.sideItem(false), background: hProfile ? COLORS.card : 'transparent', transition: 'background .2s' }}
             onMouseEnter={() => setHProfile(true)} onMouseLeave={() => setHProfile(false)}
             onClick={() => nav('/profile')} role="button" tabIndex={0}
             onKeyDown={(e) => e.key === 'Enter' && nav('/profile')}>Profile</div>

        <div style={{ ...layout.sideItem(false), background: hLogout ? COLORS.card : 'transparent', transition: 'background .2s' }}
             onMouseEnter={() => setHLogout(true)} onMouseLeave={() => setHLogout(false)}
             onClick={handleLogout} role="button" tabIndex={0}
             onKeyDown={(e) => e.key === 'Enter' && handleLogout()}>Logout</div>

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
        <div style={layout.card}>
          <h3 style={{ marginTop: 0 }}>Write a Review</h3>

          {/* Selected video (if any) or parent review */}
          <div style={{ background: COLORS.soft, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ color: COLORS.dim, marginBottom: 6 }}>
              {replyTo ? 'Viewing Review' : 'Selected Video'}
            </div>

            {replyTo && parentReview ? (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{parentReview.author?.name}</div>
                <div style={{ color: COLORS.dim, marginBottom: 6 }}>
                  {parentReview.text?.slice(0, 200)}
                  {parentReview.text?.length > 200 ? '…' : ''}
                </div>
                {selected?.id && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {selected.thumb && <img src={selected.thumb} alt="" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 6 }} />}
                    <div>
                      <div style={{ fontWeight: 600 }}>{selected.title || '(video)'}</div>
                      <div style={{ color: COLORS.dim, fontSize: 12 }}>{selected.channel}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : selected?.id ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {selected.thumb && <img src={selected.thumb} alt="" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 6 }} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{selected.title || '(video)'}</div>
                  <div style={{ color: COLORS.dim, fontSize: 12 }}>{selected.channel}</div>
                </div>
              </div>
              ) : replyToId && (fallbackTitle || fallbackSnippet) ? (
                // Fallback when coming from Users tab (mock data), no saved review yet
                <div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {fallbackTitle || '(untitled)'}
                </div>
                {fallbackSnippet && (
                <div style={{ color: COLORS.dim }}>
                    {fallbackSnippet}
                </div>
                )}
            </div>
            ) : (
              <div style={{ color: COLORS.dim }}>No video selected</div>
            )}
            {replyToId && parentReview && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={toggleLike} style={layout.reviewBtn} type="button">
                    {liked ? '♥ Liked' : '♡ Like'} • {likes.length}
                    </button>
                    <a href="#composer" style={{ ...layout.dim, textDecoration: 'none' }}>
                    Add comment
                    </a>
                </div>
            )}
          </div>

          {/* Rating (hidden when replying to a review) */}
          {!replyTo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ color: COLORS.dim }}>Rating</div>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ ...layout.input, width: 120 }}
              >
                {[5,4,3,2,1].map(n => (
                  <option key={n} value={n}>
                    {'★'.repeat(n)}{n < 5 ? ` (${n})` : ' (5)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Text */}
          <textarea
            id="composer"
            placeholder={replyTo ? 'Write your comment…' : 'Write your thoughts…'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={layout.textarea}
          />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button onClick={() => nav(-1)} style={{ ...layout.btn, background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
              Cancel
            </button>
            <button onClick={handlePost} disabled={saving} style={layout.btn}>
              {saving ? 'Posting…' : replyTo ? 'Post Comment' : 'Post Review'}
            </button>
          </div>

          {msg && <div style={{ marginTop: 10, color: COLORS.dim }}>{msg}</div>}
        </div>

        {/* Comments thread*/}
        {replyTo && parentReview && (
            <div style={{ ...layout.card, marginTop: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
                Comments ({comments.length})
            </div>

            {comments.length === 0 ? (
                <div style={{ color: COLORS.dim }}>No comments yet.</div>
            ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                {comments.map((c) => (
                    <div
                    key={c.id}
                    style={{
                        background: COLORS.soft,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 8,
                        padding: 10,
                        display: 'flex',
                        gap: 10,
                    }}
                    >
                    <div
                        style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background: COLORS.card,
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700,
                        }}
                    >
                        {(c.author?.name || 'A')[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>
                        {c.author?.name || 'Anonymous'}
                        <span
                            style={{ marginLeft: 8, color: COLORS.dim, fontSize: 12 }}
                        >
                            {new Date(c.createdAt).toLocaleString()}
                        </span>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{c.text}</div>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        )}
        <div style={{ textAlign: 'center', color: COLORS.dim, fontSize: 12, marginTop: 10 }}>
          Alpha Prototype.
        </div>
      </main>
    </div>
  );
}
