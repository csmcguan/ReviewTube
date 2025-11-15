import express from "express"
import { reviewController } from "../controllers/review.controller.js";

const router = express.Router();

// video reviews
router.post("/videos/:videoId/reviews", reviewController.writeVideoReview);
router.get("/video/:videoID/reviews", reviewController.getVideoReviews);

// channel reviews
router.post("/channel/:channelId/reviews", reviewController.writeChannelReview);
router.get("/channel/:channelId/reviews", reviewController.getChannelReviews);

// comments
router.post("/reivew/:reviewId/comments", reviewController.postReviewComment);
router.get("/reviews/:reviewId/comments", reviewController.getReviewComments);

export default router