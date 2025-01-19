import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const like = await Like.findOne({userId: req.User_id, video: videoId})

    if(like){
        try{
            await Like.findByIdAndDelete(like._id)
        }catch(error){
            throw new ApiError(500, "Failed to delete like")
        }
    }


    if(!like){
        try{
            await Like.create({userId: req.User_id, video: videoId})
        }catch(error){
            throw new ApiError(500, "Failed to create like")
        }
    }

    return res.status(200)
       .json(new ApiResponse(200, null, "Like toggled successfully"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const like = await Like.findOne({userId: req.User_id, comment: commentId})

    if(like){
        try{
            await Like.findByIdAndDelete(like._id)
        }catch(error){
            throw new ApiError(500, "Failed to delete like")
        }
    } 


    if(!like){
        try{
            await Like.create({userId: req.User_id, comment: commentId})
        }catch(error){
            throw new ApiError(500, "Failed to create like")
        }
    }

    return res.status(200)
       .json(new ApiResponse(200, null, "Like toggled successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    const like = await Like.findOne({userId: req.User_id, tweet : tweetId})

    if(like){
        try{
            await Like.findByIdAndDelete(like._id)
        }catch(error){
            throw new ApiError(500, "Failed to delete like")
        }
    } 


    if(!like){
        try{
            await Like.create({userId: req.User_id, tweet : tweetId})
        }catch(error){
            throw new ApiError(500, "Failed to create like")
        }
    }

    return res.status(200)
       .json(new ApiResponse(200, null, "Like toggled successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    
    const likedVideos = await Like.find({userId: req.User_id, video: {$ne: null}})

    return res.status(200)
       .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}