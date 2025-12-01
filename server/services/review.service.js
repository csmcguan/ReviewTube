import { env } from "../config/env.js";
import { DBManager } from "../DBManager.js";

export const reviewService = {
    // create a review.
    // we can use the same function for videos and channels by
    // specifying the type
    async createReview({ type, targetId, title, rating, reviewText, userId, username }) {
        console.log("Creating review:", {
            type,
            targetId,
            title,
            rating,
            reviewText,
            userId,
            username,
        });
        const db = new DBManager();
        const created = await db.createReviewEntry(
            type,
            targetId,
            title,
            rating,
            reviewText,
            userId,
            username
        );
        return created;
    },

    // get the reviews for a video/channel
    // PK(id, channel) how else to tell?
    // optionally give the user ID to filter
    // start and end index for paging. DB will need to handle index out
    // of bounds to return nothing
    async getReviews({ type, targetId, userId, startIndex, endIndex }) {
        console.log("Getting reviews:", { type, targetId, userId, startIndex, endIndex });
        const db = new DBManager();
        const arr = await db.getReviewEntries(
            type,
            targetId ?? null,
            null,
            null,
            userId ?? null,
            null
        );
        return db.sliceArray(arr, startIndex, endIndex);
    },

    // like a review -- link user to review
    async likeReview({ reviewId, userId }) {
        const db = new DBManager();
        // avoid double likes
        const existing = await db.getLikeEntries(reviewId, userId);
        if (existing && existing.length > 0) {
            return { ok: true };
        }
        await db.createLikeEntry(reviewId, userId);
        return { ok: true };
    },

    // remove a like from a review
    async unlikeReview({ reviewId, userId }) {
        const db = new DBManager();
        await db.deleteLikeEntries(reviewId, userId);
        return { ok: true };
    },

    // get a list of user IDs who liked a review
    async getReviewLikes(reviewId) {
        const db = new DBManager();
        const rows = await db.getLikeEntries(reviewId, null);
        const userIds = (rows || []).map((row) => row.userID);
        return {
            userIds,
            count: userIds.length,
        };
    },

    async fetchVideoDetails(videoId) {
        if (!videoId || !env.YT_API_KEY) {
            console.error("Invalid videoId or missing YT_API_KEY");
            return null;
        }

        const params = new URLSearchParams({
            part: "snippet",
            id: videoId,
            key: env.YT_API_KEY,
            maxResults: 1,
        });

        const resp = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`
        );

        if (!resp.ok) {
            console.warn("YouTube API error", resp.status);
            return null;
        }

        const data = await resp.json();
        const it = data.items?.[0];
        if (!it) {
            console.error("No video found for ID:", videoId);
            return null;
        }

        console.log("Fetched video details for ID:", videoId);

        return {
            id: videoId,
            title: it.snippet.title,
            channel: it.snippet.channelTitle,
            thumb: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url,
        };
    },

    async createComment({ reviewId, userId, text }) {
        console.log("Creating comment:", { reviewId, userId, text });

        if (!reviewId || !text) {
            console.error("Missing reviewId or text for comment");
            throw new Error("Missing reviewId or text for comment");
        }

        const db = new DBManager();
        await db.createCommentEntry(reviewId, userId ?? null, text);
        console.log("Comment created successfully");

        return {
            ok: true,
            reviewId,
            userId: userId ?? null,
            text,
        };
    },

    // get the comments for a review
    async getComments(reviewId) {
        console.log("Getting comments for reviewId:", reviewId);
        const db = new DBManager();
        const rows = await db.getCommentEntries(reviewId ?? null, null, null);
        return rows || [];
    },
};