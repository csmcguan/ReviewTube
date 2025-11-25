const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function followUser({ userId, targetId }) {
  const res = await fetch(`${API_BASE}/users/${userId}/follow/${targetId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to follow user");
  return res.json();
}

export async function unfollowUser({ userId, targetId }) {
  const res = await fetch(`${API_BASE}/users/${userId}/unfollow/${targetId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to unfollow user");
  return res.json();
}

export async function getFollowing(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}/following`);
  const data = await res.json();
  return data.following || []; // [{ id, name }, ...]
}

export async function getProfile(userId) {
  const res = await fetch(`${API_BASE}/users/me/profile?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to load profile");
  const data = await res.json();
  return data.user;  // because controller returns { ok, user }
}

// Optional: viewing another user's profile
export async function getUserProfile(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}/profile`);
  if (!res.ok) throw new Error("Failed to load user profile");
  const data = await res.json();
  return data.user;
}

export async function getFeedReviews(userId, { startIndex = 0, count = 20 } = {}) {
  const params = new URLSearchParams({
    startIndex: String(startIndex),
    count: String(count),
  });

  const res = await fetch(
    `${API_BASE}/users/${encodeURIComponent(userId)}/feed?${params.toString()}`
  );

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Failed to load feed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.feed || [];
}

export async function updateProfile({ userId, bio }) {
  // no backend endpoint
  return { ok: true };
}

export async function searchUsers({ query, maxResults = 10 }) {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });

  const res = await fetch(`${API_BASE}/users/search?${params.toString()}`);

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Failed to search users: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.users || [];
}
