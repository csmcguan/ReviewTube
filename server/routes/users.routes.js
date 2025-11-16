import express from "express";
import { userController } from "../controllers/users.controller.js";

const router = express.Router();

// signup for ReviewTube!
router.post("/signup", userController.signup);

// login enpoint
router.post("/login", userController.login);

// logout endpoint
router.post("/logout", userController.logout);

// follow another user
router.post(
    "/:userId/follow/:targetId",
    userController.follow
);

// unfollow another user
router.post(
    "/:userId/unfollow/:targetId",
    userController.blockUser
);

// block another user
router.post(
    "/:userId/block/:targetId",
    userController.blockUser
);

// Profiles
router.get("/me", userController.getMyProfile);         // current logged-in user
router.get("/:userId", userController.getUserProfile);  // view another user's profile

// feed
router.get("/:userId/feed", userController.getUserFeed);

export default router;