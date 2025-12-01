const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function postVideoReview({ videoId, userId, rating, text, videoTitle, authorName }) {
  const res = await fetch(`${API_BASE}/reviews/video/${encodeURIComponent(videoId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating,
      reviewText: text,
      userId,
      videoTitle,
      authorName,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Failed to post review: ${res.status} ${err}`);
  }

  return res.json(); // Review created from the controller
}

export async function postReviewComment({ reviewId, userId, text }) {
  const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, userId }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Failed to post comment: ${res.status} ${err}`);
  }

  return res.json();
}

export async function getVideoReviews({ videoId, userId, startIndex, endIndex }) {
  const params = new URLSearchParams();
  if (userId != null) params.set("userId", userId);
  if (startIndex != null) params.set("startIndex", startIndex);
  if (endIndex != null) params.set("endIndex", endIndex);

  const res = await fetch(
    `${API_BASE}/reviews/video/${encodeURIComponent(videoId)}?${params.toString()}`,
  );

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Failed to fetch reviews: ${res.status} ${err}`);
  }

  return res.json(); // Array of reviews from the controller
}

export async function getVideoDetails(videoId) {
  if (!videoId) {
    return null;
  }

  const res = await fetch(
    `${API_BASE}/reviews/video/${encodeURIComponent(videoId)}/details`
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

// get the comments for a review
export async function getReviewComments(reviewId) {
  const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}/comments`);

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Failed to load comments: ${res.status} ${err}`);
  }

  return res.json(); // array of raw comment rows from backend
}

// *** feed exists under the users router, so moved this to usersApi.js ***
// export async function getFeedReviews() {
//   const res = await fetch(`${API_BASE}/reviews/feed`);

//   if (!res.ok) {
//     const err = await res.text().catch(() => "");
//     throw new Error(`Failed to load feed: ${res.status} ${err}`);
//   }

//   return res.json(); // raw reviews from backend
// }
