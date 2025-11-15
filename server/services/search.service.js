import { env } from "../config/env.js";

export async function youtubeSearch({ query, type, maxResults = 10 }) {
  console.log("Searching YouTube:", { query, type, maxResults });
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    maxResults: String(maxResults),
    type: type,
    key: env.YT_API_KEY,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  
  // make sure we got a good response
  if (!res.ok) {
    console.error("YouTube API error:", res.statusText);
    throw new Error(`YouTube API error: ${res.statusText}`);
  }
  return await res.json();
}
