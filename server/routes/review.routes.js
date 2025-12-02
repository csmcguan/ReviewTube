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

// Likes
router.post(
  "/:reviewId/like",
  reviewController.likeReview      // now implemente!
);

router.post(
  "/:reviewId/unlike",
  reviewController.unlikeReview    // now implemented!
);

router.get(
  "/:reviewId/likes",
  reviewController.getReviewLikes  // now implemented!
);

// get details about a video
router.get("/video/:videoId/details", reviewController.getVideoDetails);

// channel reviews
router.post(
  "/channel/:channelId",
  reviewController.writeChannelReview
);

router.get(
  "/channel/:channelId",
  reviewController.getChannelReviews
);

router.get(
  "/channel/:channelId/details",
  reviewController.getChannelDetails
);

export default router