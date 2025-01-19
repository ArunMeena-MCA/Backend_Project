import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { tweetText } = req.body

    if(!tweetText){
        throw new ApiError(400, "Tweet text is required")
    }

    const tweet = await Tweet.create({ 
        owner: req.User._id,
        content : tweetText 
    })

    if(!tweet){
        throw new ApiError(500, "Failed to create tweet")
    }

    return res.status(201)
       .json(new ApiResponse(200, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    const tweets = await Tweet.find({ owner: userId })
    .sort({createdAt: -1})

    if(!tweets){
        throw new ApiError(404, "No tweets found for this user")
    }

    return res.json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { tweetText } = req.body

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {content: tweetText}, {new: true})

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200)
       .json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res.json(new ApiResponse(200, tweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}