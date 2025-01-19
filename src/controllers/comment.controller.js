import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const skip = (page-1)*limit

    const comments = await Comment.find({video: videoId})
   .sort({createdAt: -1})
   .skip(skip)
   .limit(limit)

    return res.json(new ApiResponse(200,comments,"Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {commentText} = req.body

    if(!commentText){
        throw new ApiError(400,"comment text is required")
    }

    const newComment = await Comment.create({
        content : commentText,
        video : videoId,
        owner : req.User._id
    })

    if(!newComment){
        throw new ApiError(500,"Failed to create comment")
    }

    return res.status(201)
   .json( new ApiResponse(200,newComment,"Comment created Successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {commentText} = req.body

    // if(!isValidObjectId(commentId)){
    //     throw new ApiError(400,"Invalid comment id")
    // }

    const comment = await Comment.findByIdAndUpdate(commentId, {content: commentText}, {new: true})

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    return res.status(200)
   .json( new ApiResponse(200,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    // if(!isValidObjectId(commentId)){
    //     throw new ApiError(400,"Invalid comment id")
    // }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    return res.status(200)
   .json( new ApiResponse(200,comment,"Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }