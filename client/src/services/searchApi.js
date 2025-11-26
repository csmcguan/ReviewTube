const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function searchMedia({ query, type, maxResults = 10, pageToken }) {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      type,
      maxResults,
      pageToken,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Search failed: ${res.status} ${err}`);
  }

  // Backend returns { items: [...], nextPageToken: '...' }
  return res.json();
}