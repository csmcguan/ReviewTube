import { jest } from "@jest/globals";
import { createMockResponse, createMockNext } from "./testUtils.js";

await jest.unstable_mockModule("../services/search.service.js", () => ({
    youtubeSearch: jest.fn().mockResolvedValue({
        items: [
            {
                id: { videoId: "id" },
                snippet: {
                    title: "test video",
                    description: "test description",
                    channelId: "channel",
                    channelTitle: "channel name",
                    publishedAt: new Date().toISOString(),
                    thumbnails: { default: { url: "http://example.com/thumb.jpg" } }
                }
            }
        ],
        nextPageToken: "NEXT"
    })
}));

const { default: searchController } = await import("../controllers/search.controller.js");

// Small helper for req
function createMockRequest(body = {}) {
    return { body };
}

describe("searchController.search", () => {
    it("returns 400 if query is missing or empty", async () => {
        const res = createMockResponse();
        const next = createMockNext();
        const req = createMockRequest({ type: "videos" });

        await searchController.search(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 if type is missing", async () => {
        const res = createMockResponse();
        const next = createMockNext();
        const req = createMockRequest({ query: "jazz" });

        await searchController.search(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 200", async () => {
        // for some reason it didn;t work when outsid... what do i know
        const { youtubeSearch } = await import("../services/search.service.js");

        const res = createMockResponse();
        const next = createMockNext();
        const req = createMockRequest({
            query: "jazz",
            type: "videos",
            maxResults: 5
        });

        await searchController.search(req, res, next);

        expect(youtubeSearch).toHaveBeenCalledWith({
            query: "jazz",
            type: "videos",
            maxResults: 5,
            pageToken: undefined
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(next).not.toHaveBeenCalled();
    });
});