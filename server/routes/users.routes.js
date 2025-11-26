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
    userController.unfollow
);

// block another user
router.post(
    "/:userId/block/:targetId",
    userController.blockUser
);

// search
router.get("/search", userController.searchUsers);

// Profiles
router.get("/me", userController.getMyProfile);         // current logged-in user
router.get("/:userId", userController.getUserProfile);  // view another user's profile

// feed
router.get("/:userId/feed", userController.getUserFeed);

// followed users
router.get(
  "/:userId/following",
  userController.getFollowing      // to be implemented
);

export default router;