import { env } from "../config/env.js";

export async function youtubeSearch({ query, type, maxResults = 10 }) {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    maxResults: String(maxResults),
    type: type,
    key: env.YT_API_KEY,
  });
  console.log(params);

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.statusText}`);
  }
  return await res.json();
}
