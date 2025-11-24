import { env } from "../config/env.js";

export async function youtubeSearch({ query, type, maxResults = 10, pageToken }) {
    console.log("Searching YouTube:", { query, type, maxResults, pageToken });

    // Map frontend mode -> YouTube API type
    let ytType = type;
    if (type === "videos") {
        ytType = "video";
    } else if (type === "channels") {
        ytType = "channel";
    }

    const params = new URLSearchParams({
        part: "snippet",
        q: query,
        maxResults: String(maxResults),
        type: ytType,
        key: env.YT_API_KEY,
    });

    if (pageToken) {
        params.set("pageToken", pageToken);
    }

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);

    // make sure we got a good response
    if (!res.ok) {
        console.error("YouTube API error:", res.statusText);
        throw new Error(`YouTube API error: ${res.statusText}`);
    }
    return await res.json();
}
