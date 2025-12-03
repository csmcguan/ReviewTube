const API_BASE = process.env.REACT_APP_API_URL || "/api";

export async function likeReview({ reviewId, userId }) {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to like review");
  return res.json();
}

export async function unlikeReview({ reviewId, userId }) {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}/unlike`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to unlike review");
  return res.json();
}

export async function getReviewLikes(reviewId) {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}/likes`);
  if (!res.ok) throw new Error("Failed to load likes");
  return res.json(); // e.g. { users: [...], count: N }
}
