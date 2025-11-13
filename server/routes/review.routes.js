import express from "express"
import reviewController from "../controllers/review.controller";

const router = express.Router();

// video reviews
router.post("/video", reviewController.writeVideoReview);
router.get("/video", reviewController.getVideoReview);

// channel reviews
router.post("/channel", reviewController.writeChannelReview);
router.get("/channel", reviewController.getChannelReview);

export default router