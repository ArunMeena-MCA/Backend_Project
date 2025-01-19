import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/:channelId").post(toggleSubscription); // Toggle subscription for a user

router.route("/channel/:channelId").get(getUserChannelSubscribers); // Get subscribers of a channel

router.route("/subscriber/:subscriberId").get(getSubscribedChannels); // Get all subscribed channels by the authenticated user

export default router;