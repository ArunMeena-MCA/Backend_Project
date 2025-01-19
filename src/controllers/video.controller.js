// import mongoose from "mongoose";
import {Video} from "../models/video.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {v2} from "cloudinary"
import {ObjectId} from 'mongodb'
// import { Cursor } from "mongoose";

const getAllVideos = asyncHandler(async(req,res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    const skip = (page-1) * limit;

    const filter = {}

    if(query){
        filter.title = {$regex: query, $options: 'i'}
    }

    if(userId){
        filter.owner = userId
    }

    // console.log(filter)

    const sortOptions = {};
    sortOptions[sortBy] = sortType === 'asc' ? 1 : -1

    // console.log(sortOptions)
    console.log(filter)

    try{
        const videos = await Video.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        const totalVideos = await Video.countDocuments(filter);

        res.status(200)
        .json(
            new ApiResponse(200,{
                    videos,
                    totalVideos,
                    totalPages: Math.ceil(totalVideos / limit),
                    CurrentPage: page,
                },
                "Videos fetched successfully"
            )
        )
    }
    catch(error){
        console.error(error)
        throw new ApiError(500,"Something went wrong while fetching videos")
    }
})

const publishVideo = asyncHandler(async(req,res) => {
    const {title,description} = req.body;

    if(!title){
        throw new ApiError(400,"title is required!!")
    }
    if(!description){
        throw new ApiError(400,"description is required!!")
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(400,"Video file is required...");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required...");
    }
    
    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail= await uploadOnCloudinary(thumbnailLocalPath);

    if(!video){
        throw new ApiError(400,"Video is required");
    }
    if(!thumbnail){
        throw new ApiError(400,"thumbnail is required");
    }

    const newVideo = await Video.create({
        title,
        description,
        thumbnail : thumbnail.url,
        videoFile : video.url,
        owner : req.User._id,
        duration : video.duration
    })

    if(!newVideo){
        throw new ApiError(500,"Something went wrong while uploading the video")
    }

    return res.status(201)
    .json(
        new ApiResponse(200,newVideo,"Video Uploaded Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"Video not found!!")
    }

    return res.status(200).json(
        new ApiResponse(200,video,"Video found")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const {title,description} = req.body;

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"video not found to update")
    }

    if(title){
        video.title = title;
    }
    if(description){
        video.description = description;
    }

    const thumbnailLocalPath = req.file.path;

    if(thumbnailLocalPath){
        const oldThumbnailUrl = video.thumbnail;

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        video.thumbnail = thumbnail.url;

        let oldPublicId;
        if (oldThumbnailUrl) {
            const urlParts = oldThumbnailUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const publicId = fileName.split('.')[0]; // Extracting the public_id (before the file extension)
            oldPublicId = publicId;
        }

        // Delete the old image from Cloudinary (if exists)
        if (oldPublicId) {
            try {
                await v2.uploader.destroy(oldPublicId);
            } catch (error) {
                throw new ApiError(500, "Error while deleting thumbnail");
            }
        }
    }

    await video.save({validateBeforeSave: false})

    return res.status(200)
    .json(
        new ApiResponse(200,video,"Video details updated successfully !!")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    let { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video not found to delete")
    }
    const videoUrl = video.videoFile;
    const thumbnailUrl = video.thumbnail;

    let oldPublicId;

    if (videoUrl) {
        const urlParts = videoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = fileName.split('.')[0]; // Extracting the public_id (before the file extension)
        oldPublicId = publicId;
    }

    // Delete the old image from Cloudinary (if exists)
    if (oldPublicId) {
        try {
            await v2.uploader.destroy(oldPublicId);
        } catch (error) {
            throw new ApiError(500, "Error while deleting video");
        }
    }

    if (thumbnailUrl) {
        const urlParts = thumbnailUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = fileName.split('.')[0]; // Extracting the public_id (before the file extension)
        oldPublicId = publicId;
    }

    // Delete the old image from Cloudinary (if exists)
    if (oldPublicId) {
        try {
            await v2.uploader.destroy(oldPublicId);
        } catch (error) {
            throw new ApiError(500, "Error while deleting thumbnail");
        }
    }

    videoId = new ObjectId(videoId);
    await Video.deleteOne(videoId)

    return res.status(200).json(
        new ApiResponse(200,"video deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"video not found to toggle")
    }

    video.ispublished = video.ispublished ? false : true;
    await video.save({validateBeforeSave: false})

    return res.status(200)
    .json(
        new ApiResponse(200,video,"Publish status updated")
    )
})

const incrementViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"video not found to increment views")
    }

    video.views += 1;
    await video.save({validateBeforeSave: false})

    return res.status(200)
    .json( new ApiResponse(200,video,"Views incremented" ))
})


export{
    getAllVideos,
    getVideoById,
    publishVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViews
}

