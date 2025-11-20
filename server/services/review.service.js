import { start } from "repl";
import {DBManager} from "../DBManager.js";
export const reviewService = {
    // create a review.
    // we can use the same function for videos and channels by
    // specifying the type
<<<<<<< HEAD
    async createReview({type, targetId, rating, reviewText, userId}) {
        console.log("Creating review:", {type, targetId, rating, reviewText, userId});  
        const db = new DBManager();
        await db.createReviewEntry(type, targetId, rating, reviewText, userId);
=======
    async createReview({ type, targetId, rating, reviewText, userId }) {
        console.log("Creating review:", { type, targetId, rating, reviewText, userId });
        // CONNECT TO DB
>>>>>>> d5142ac28c4ef661ebdb85855593dc6fc7a09ed3
    },

    // get the reviews for a video/channel
    // PK(id, channel) how else to tell?
    // optionally give the user ID to filter
    // start and end index for paging. DB will need to handle index out
    // of bounds to return nothing
<<<<<<< HEAD
    async getReviews({type, targetId, userId, startIndex, endIndex}) {
        console.log("Getting reviews:", {type, targetId, userId, startIndex, endIndex});
        const db = new DBManager();
        return await db.getReviewEntries(type, targetId, userId, startIndex, endIndex);
=======
    async getReviews({ type, targetId, userId, startIndex, endIndex }) {
        console.log("Getting reviews:", { type, targetId, userId, startIndex, endIndex });
        // CONNECT TO DB
>>>>>>> d5142ac28c4ef661ebdb85855593dc6fc7a09ed3
    }
};