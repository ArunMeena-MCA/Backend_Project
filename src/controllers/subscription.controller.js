import mongoose, {isValidObjectId} from "mongoose"
import { user } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    const subscription = await Subscription.find({subscriber: req.User._id,channel : channelId})

    if(!subscription.length){
        const newSubs = await Subscription.create({
            channel : channelId,
            subscriber : req.User._id
        })

        if(!newSubs){
            throw new ApiError(500,"Failed to create subscription")
        }
    }
    else{
        await Subscription.findByIdAndDelete(subscription[0]._id)
    }
    return res.json(new ApiResponse(200, subscription, "Subscription toggled successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscribers = await Subscription.find({channel : channelId})

    return res.status(200)
    .json(
        new ApiResponse(200, subscribers.map(sub => sub.subscriber), "Subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const channels = await Subscription.find({subscriber : subscriberId})

    return res.status(200)
    .json(
        new ApiResponse(200, channels.map(channel => channel.channel), "Channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}