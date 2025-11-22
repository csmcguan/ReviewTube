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
