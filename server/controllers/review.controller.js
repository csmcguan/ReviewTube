import { reviewService } from "../services/review.service.js";

const RATING_MIN = 0;
const RATING_MAX = 5;

export const reviewController = {

    // write a review for a video
    async writeVideoReview(req, res, next) {
        try {
            const { videoId } = req.params;
            const { rating, reviewText, userId, videoTitle, authorName } = req.body;

            if (!rating || !reviewText) {
                console.error("No review data given");
                return res.status(400).json({ error: "No review data given" });
            }

            if (rating && (rating < RATING_MIN || rating > RATING_MAX)) {
                console.error("Rating out of boundss")
                return res.status(400).json({ error: "Rating out of bounds" });
            }

            if (!videoTitle) {
                console.error("Missing video title");
            }

            if (!authorName) {
                console.error("Missing author name");
            }

            await reviewService.createReview({
                type: "video",
                targetId: videoId,
                title: videoTitle ?? null,
                rating,
                reviewText,
                userId,
                username: authorName ?? null,
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

    // FEED IN USERS NOW
    // Get reviews for home feed
    // async getFeed(req, res, next) {
    //     try {
    //         // Currently no filtering, just get all reviews, given time constraints
    //         const reviews = await reviewService.getReviews({
    //             type: null,       // no type filter
    //             targetId: null,   // no target filter
    //             userId: null,     // no user filter
    //             startIndex: null, 
    //             endIndex: null,
    //         });

    //         return res.status(200).json(reviews);
    //     } catch (err) {
    //         console.error("Get feed error:", err);
    //         next(err);
    //     }
    // },

    async likeReview(req, res, next) {
        try {
            const { reviewId } = req.params;
            const { userId } = req.body;

            if (!userId) {
                console.error("Missing userId in likeReview");
                return res.status(400).json({ ok: false, error: "Missing userId" });
            }

            await reviewService.likeReview({ reviewId, userId });
            return res.json({ ok: true });
        } catch (err) {
            console.error("Like review error:", err);
            next(err);
        }
    },

    async unlikeReview(req, res, next) {
        try {
            const { reviewId } = req.params;
            const { userId } = req.body;

            // make sure userId is given
            if (!userId) {
                console.error("Missing userId in unlikeReview");
                return res.status(400).json({ ok: false, error: "Missing userId" });
            }

            // call service to unlike
            await reviewService.unlikeReview({ reviewId, userId });
            return res.json({ ok: true });
        } catch (err) {
            console.error("Unlike review error:", err);
            next(err);
        }
    },

    async getReviewLikes(req, res, next) {
        try {
            const { reviewId } = req.params;

            // call service to get likes
            const data = await reviewService.getReviewLikes(reviewId);

            // return userIds and count
            return res.json({ userIds: data.userIds, count: data.count });
        } catch (err) {
            console.error("Get review likes error:", err);
            next(err);
        }
    },

    async getVideoDetails(req, res, next) {
        try {
            const { videoId } = req.params;
            const meta = await reviewService.fetchVideoDetails(videoId);

            if (!meta) {
                console.error("Video not found or metadata unavailable for ID:", videoId);
                return res.status(404).json({ error: "Video not found or metadata unavailable" });
            }

            return res.json(meta);
        } catch (err) {
            console.error("Get video details error:", err);
            next(err);
        }
    },
};