import { reviewService } from "../services/review.service.js";

const RATING_MIN = 0;
const RATING_MAX = 5;

export const reviewController = {

    // write a review for a video
    async writeVideoReview(req, res, next) {
        try {
            const { videoId } = req.params;
            const { rating, reviewText, userId } = req.body;

            if (!rating || !reviewText) {
                console.error("No review data given");
                return res.status(400).json({ error: "No review data given" });
            }

            if (rating && (rating < RATING_MIN || rating > RATING_MAX)) {
                console.error("Rating out of boundss")
                return res.status(400).json({ error: "Rating out of bounds" });
            }

            await reviewService.createReview({
                type: "video",
                targetId: videoId,
                rating,
                reviewText: reviewText,
                userId: userId
            });

            return res.status(201).json({ ok: true });
        } catch (err) {
            console.error("Write video review error:", err);
            next(err);
        }
    },

    // get the reviews for a video
    // optionally supply a userId to narrow down
    async getVideoReviews(req, res, next) {
        try {
            const { videoId } = req.params;
            const { userId, startIndex, endIndex } = req.query;

            // fetch the comments requested
            const reviews = await reviewService.getReviews({
                type: "video",
                targetId: videoId,
                userId: userId ?? null,
                startIndex: startIndex !== undefined ? Number(startIndex) : null,
                endIndex: endIndex !== undefined ? Number(endIndex) : null,
            });

            res.status(200).json(reviews);
        } catch (err) {
            console.error("Get video reviews error:", err);
            next(err);
        }
    },

    // write a review for a channel
    async writeChannelReview(req, res, next) {
        try {
            const { channelId } = req.params;
            const { rating, reviewText, userId } = req.body;

            if (!rating || !reviewText) {
                console.error("Missing review content");
                return res.status(400).json({ error: "Missing review content" });
            }

            await reviewService.createReview({
                type: "channel",
                targetId: channelId,
                rating,
                reviewText,
                userId: userId || 1,
            });

            return res.status(201).json({ ok: true });
        } catch (err) {
            console.error("Write channel review error:", err);
            next(err);
        }
    },

    async getChannelReviews(req, res, next) {
        try {
            const { channelId } = req.params;

            const reviews = await reviewService.getReviews({
                type: "channel",
                targetId: channelId,
                userId: userId ?? null,
                startIndex: startIndex !== undefined ? Number(startIndex) : null,
                endIndex: endIndex !== undefined ? Number(endIndex) : null,
            });

            return res.status(200).json(reviews);
        } catch (err) {
            console.error("Get channel reviews error:", err);
            next(err);
        }
    },

    //
    // -------------------------
    // REVIEW COMMENTS
    // -------------------------
    //
    async postReviewComment(req, res, next) {
        try {
            const { reviewId } = req.params;
            const { text, userId } = req.body;

            if (!text) {
                console.error("Missing comment text");
                return res.status(400).json({ error: "Missing comment text" });
            }

            const comment = await reviewService.createComment({//Create comment hasn't been implemented yet in service
                reviewId,
                text,
                userId: userId || 1,
            });

            return res.status(201).json(comment);
        } catch (err) {
            console.error("Post review comment error:", err);
            next(err);
        }
    },

    async getReviewComments(req, res, next) {
        try {
            const { reviewId } = req.params;

            const comments = await reviewService.getComments(reviewId);//get comments hasn't been implemented yet in service

            return res.status(200).json(comments);
        } catch (err) {
            console.error("Get review comments error:", err);
            next(err);
        }
    },

    // Get reviews for home feed
    async getFeed(req, res, next) {
        try {
            // Currently no filtering, just get all reviews, given time constraints
            const reviews = await reviewService.getReviews({
                type: null,       // no type filter
                targetId: null,   // no target filter
                userId: null,     // no user filter
                startIndex: null, 
                endIndex: null,
            });

            return res.status(200).json(reviews);
        } catch (err) {
            console.error("Get feed error:", err);
            next(err);
        }
    },

};