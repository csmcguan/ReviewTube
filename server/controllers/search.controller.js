import * as searchService from "../services/search.service.js";

const searchController = {
	async search(req, res, next) {
		try {
			const { query, type, maxResults } = req.body;

			// make sure we actually got something
			if (!query) {
				console.error("Missing search query");
				return res.status(400).json({ error: "Missing search query" });
			}

			// make sure the type is specified
			if (!type) {
				console.error("Missing media search type");
				return res.status(400).json({ error: "Missing media search type" });
			}

			const data = await searchService.youtubeSearch({ query, type, maxResults });
			const strippedResults = (data.items || []).map((it) => ({
				videoId: it.id.videoId,
				title: it.snippet.title,
				channelTitle: it.snippet.channelTitle,
				thumbnail: it.snippet.thumbnails.medium?.url || it.snippet.thumbnails.default?.url,
				publishedAt: new Date(it.snippet.publishedAt).toLocaleDateString(),
			}));
			console.log("Search results:", strippedResults);
			res.status(200).json(strippedResults);
		} catch (err) {
			console.error("Search error:", err);
			next(err); // Pass errors to a central error handler
		}
	}
};

export default searchController;