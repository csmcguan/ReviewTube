import * as searchService from "../services/search.service.js";

const searchController = {
	async search(req, res, next) {
		try {
			const { query, type, maxResults, pageToken } = req.body || {};

			// make sure we actually got something
			if (!query || !String(query).trim()) {
				console.error("Missing search query");
				return res.status(400).json({ error: "Missing search query" });
			}

			if (!type) {
				console.error("Missing media search type");
				return res.status(400).json({ error: "Missing media search type" });
			}

			// Normalise the mode and the type used for shaping the response
			const mode = type; // e.g. 'videos' | 'channels' | 'video' | 'channel'

			// Call the YouTube service (it handles mapping videos -> video, etc.)
			const data = await searchService.youtubeSearch({
				query: String(query).trim(),
				type: mode,
				maxResults,
				pageToken,
			});

			const items = data.items || [];
			let shapedItems;

			// VIDEOS
			if (mode === "videos" || mode === "video") {
				shapedItems = items.map((it) => ({
					id: it.id?.videoId || null,
					title: it.snippet?.title || "",
					channel: it.snippet?.channelTitle || "",
					thumb:
						it.snippet?.thumbnails?.medium?.url ||
						it.snippet?.thumbnails?.default?.url ||
						null,
					publishedAt: it.snippet?.publishedAt
						? new Date(it.snippet.publishedAt).toLocaleDateString()
						: null,
				}));
			}
			// CHANNELS
			else if (mode === "channels" || mode === "channel") {
				shapedItems = items.map((it) => ({
					id: it.id?.channelId || null,
					title: it.snippet?.title || "",
					description: it.snippet?.description || "",
					thumb:
						it.snippet?.thumbnails?.high?.url ||
						it.snippet?.thumbnails?.medium?.url ||
						it.snippet?.thumbnails?.default?.url ||
						null,
				}));
			}
			// Unsupported mode (e.g. 'users' – frontend is still mocking those)
			else {
				console.error("Unsupported search type:", mode);
				return res.status(400).json({ error: `Unsupported search type: ${mode}` });
			}

			const responsePayload = {
				items: shapedItems,
				nextPageToken: data.nextPageToken || null,
			};

			console.log("Search results:", responsePayload);
			return res.status(200).json(responsePayload);
		} catch (err) {
			console.error("Search error:", err);
			next(err); // Pass errors to a central error handler
		}
	},
};

export default searchController;