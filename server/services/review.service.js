import { start } from "repl";
import { DBManager } from "../DBManager.js";
export const reviewService = {
    // create a review.
    // we can use the same function for videos and channels by
    // specifying the type
    async createReview({ type, targetId, rating, reviewText, userId, targetTitle, targetChannel }) {
        console.log("Creating review:", { type, targetId, rating, reviewText, userId, targetTitle, targetChannel });
        const db = new DBManager();
        const created = await db.createReviewEntry(type, targetId, rating, reviewText, userId, targetTitle, targetChannel);
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
        const arr = await db.getReviewEntries(type, targetId, userId);
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
};