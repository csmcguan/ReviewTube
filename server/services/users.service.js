// services/user.service.js
import { DBManager } from "../DBManager.js";

const dbManager = new DBManager();

export const userService = {

    // handle signup
    async signup({ name, email, password }) {

        //
        // WE NEED TO HASH PASSWORDS
        //

        const u = await dbManager.getUserData(email);
        if (u) {
            console.error("Email already registered during:", email);
            return null;
        }

        console.log("Signing up user:", email);
        const created = await dbManager.createUserEntry(name, email, password, "", new Date());

        // we probably need to have the DB assign an id
        return { id: created._id.toString(), username: created.username, email: created.email };
    },


    // handle login
    async login({ email, password }) {
        const u = await dbManager.getUserData(email);
        console.log("Attempting to log in user:", email);
        if (u && u.password === password) {
            console.log("Login successful for user:", email);
            return { ok: true, user: { id: u._id.toString(), name: u.username, email: u.email } };
        }
    },

    // handle follow
    async follow({ userId, targetId }) {
        // Prevent self-follow
        if (userId === targetId) {
            console.error("Attempted to follow self:", userId);
            throw new Error("Cannot follow yourself");
        }

        // check if already following
        const existing = await dbManager.getFriendEntries(userId, targetId, null);

        if (!existing || existing.length === 0) {
            console.log("Creating new follow entry from", userId, "to", targetId);
            // create a new following entry
            await dbManager.createFriendEntry(userId, targetId, "following");
        } else {
            console.log("Updating existing follow entry from", userId, "to", targetId);
            // Update status to following
            await dbManager.updateFriendEntries(userId, targetId, "following");
        }
    },

    // handle unfollow
    async unfollow({ userId, targetId }) {
        if (userId === targetId) {
            return;
        }

        // make sure there actually is a relationship
        const existing = await dbManager.getFriendEntries(userId, targetId, null);
        if (existing && existing.length > 0) {
            console.log("Removing follow entry from", userId, "to", targetId);
            await dbManager.updateFriendEntries(userId, targetId, "none");
        }
    },

    // handle blocking a user
    async blockUser({ userId, targetId }) {

    },

    async getFollowing(userId) {
        // get followers
        console.log("Fetching following list for user:", userId);
        const entries = await dbManager.getFriendEntries(userId, null, "following");
        if (!entries || entries.length === 0) {
            console.log("No following entries found for user:", userId);
            return [];
        }

        const results = [];
        for (const fr of entries) {
            try {
                const u = await dbManager.getUserDataID(fr.secondID);

                if (!u) {
                    continue;
                }

                results.push({
                    id: u._id.toString(),
                    name: u.username,
                    email: u.email,
                });
            } catch (err) {
                console.error("Error fetching followed user data:", err);
            }
        }
        return results;
    },

    // get a user's profile
    async getProfile(userId) {
        const user = await dbManager.getUserDataID(userId);
        if (!user) {
            return null;
        }

        return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
            bio: user.profileinfo ?? "",
        };
    },

    async getUserFeed(userId, startIndex, count) {
        console.log("Fetching feed for user:", userId);
        // get my friends
        const followingEntries = await dbManager.getFriendEntries(
            userId,
            null,           // any secondID
            "following"     // status
        );

        // get their user IDs
        const followingIds = (followingEntries || []).map((fr) => fr.secondID);

        // want to see my own reviews in my feed
        const authorIds = [userId, ...followingIds];

        if (authorIds.length === 0) {
            console.log("No feed content found");
            return [];
        }

        // get reviews for each user
        const allEntries = await dbManager.queryCollection(
            dbManager.collReview(),
            { userId: { $in: authorIds } }
        );

        if (!allEntries || allEntries.length === 0) {
            console.log("User has friends, but no reviews written");
            return [];
        }

        // sort by time
        allEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // slice if needed
        const endIndex = startIndex + count;
        const page = allEntries.slice(startIndex, endIndex);

        // Build a map of userId -> username so we don't query the same user repeatedly
        const authorNameMap = new Map();
        for (const r of page) {
            if (!authorNameMap.has(r.userId)) {
                const u = await dbManager.getUserDataID(r.userId);
                authorNameMap.set(r.userId, u?.username || null);
            }
        }

        // Shape the objects for the frontend
        const shaped = page.map((r) => ({
            // keep original fields
            ...r,
            id: r._id?.toString?.() || r._id || r.id,
            authorName: authorNameMap.get(r.userId) || null,
            videoTitle:
                r.type === "video" || r.type === "channel"
                    ? r.targetTitle || r.targetId
                    : r.targetId,
        }));

        return page;
    },

    async searchUsers({ query, maxUsers = 10, maxReviewsPerUser = 3 }) {
        const q = String(query || "").trim();
        if (!q) return [];

        // case-insensitive regex for username
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

        // 1. find matching users by username
        const rawUsers = await dbManager.queryCollection(
            dbManager.collUser(),
            { username: { $regex: regex } }
        );

        if (!rawUsers || rawUsers.length === 0) return [];

        const limitedUsers = rawUsers.slice(0, maxUsers);
        const results = [];

        for (const u of limitedUsers) {
            const userId = u._id.toString();

            // 2. get this user's feed entries (newest first)
            const allReviews = await dbManager.getUserFeedEntries(userId);
            const recent = (allReviews || []).slice(0, maxReviewsPerUser);

            // 3. shape reviews for the UI
            const shapedReviews = recent.map((r) => {
                const fallbackTitle =
                    r.type === "video"
                        ? `Review on video ${r.targetId}`
                        : r.type === "channel"
                            ? `Review on channel ${r.targetId}`
                            : "Review";

                const baseTitle = r.targetTitle || fallbackTitle;

                const text = r.reviewText || "";
                const snippet =
                    text.length > 120 ? text.slice(0, 117).trimEnd() + "..." : text;

                return {
                    id: r._id.toString(),
                    title: baseTitle,
                    snippet,
                };
            });

            results.push({
                id: userId,
                name: u.username,
                email: u.email,
                bio: u.profileinfo ?? "",
                reviews: shapedReviews,
            });
        }

        return results;
    },
};
