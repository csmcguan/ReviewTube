import { start } from "repl";
import {DBManager} from "../DBManager.js";
export const reviewService = {
    // create a review.
    // we can use the same function for videos and channels by
    // specifying the type
    async createReview({type, targetId, rating, reviewText, userId}) {
        console.log("Creating review:", {type, targetId, rating, reviewText, userId});  
        const db = new DBManager();
        await db.createReviewEntry(type, targetId, rating, reviewText, userId);
    },

    // get the reviews for a video/channel
    // PK(id, channel) how else to tell?
    // optionally give the user ID to filter
    // start and end index for paging. DB will need to handle index out
    // of bounds to return nothing
    async getReviews({type, targetId, userId, startIndex, endIndex}) {
        console.log("Getting reviews:", {type, targetId, userId, startIndex, endIndex});
        const db = new DBManager();
        const arr = await db.getReviewEntries(type, targetId, userId);
        return db.sliceArray(arr, startIndex, endIndex);
    }
};