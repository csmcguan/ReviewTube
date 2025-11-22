import express from "express"
import { reviewController } from "../controllers/review.controller.js";

const router = express.Router();

// video reviews
router.post(
    "/video/:videoId",
    reviewController.writeVideoReview
);

router.get(
    "/video/:videoId",
    reviewController.getVideoReviews
);

// channel reviews
router.post(
    "/channel/:channelId",
    reviewController.writeChannelReview
);

router.get(
    "/channel/:channelId",
    reviewController.getChannelReviews
);

// comments
router.post(
    "/:reviewId/comments",
    reviewController.postReviewComment
);

router.get(
    "/:reviewId/comments",
    reviewController.getReviewComments
);

// Home feed
router.get(
  "/feed",
  reviewController.getFeed
);

export default router