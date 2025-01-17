import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name,description} = req.body;
    
    if(!name ||!description){
        throw new ApiError(400,"name and description are required")
    }

    if(!name){
        throw new ApiError(400,"name is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.User._id
    })

    if(!playlist){
        throw new ApiError(500,"Failed to create playlist")
    }

    return res.status(201)
       .json(new ApiResponse(200, playlist, "Playlist created successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const playlists = await Playlist.find({owner: userId})

    if(!playlists){
        throw new ApiError(404,"No playlists found for this user")
    }
    
    return res.json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
 
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    return res.json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) ||!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist or video id")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $push: {videos: videoId}
    }, {new: true})

    if(!playlist){
        throw new ApiError(500,"Failed to add video to playlist")
    }
    
    return res.json(new ApiResponse(200, playlist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!isValidObjectId(playlistId) ||!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist or video id")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {videos: videoId}
    }, {new: true})

    if(!playlist){
        throw new ApiError(500,"Failed to remove video from playlist")
    }

    return res.json(new ApiResponse(200, playlist, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    return res.json(new ApiResponse(200, playlist, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    if(!name || !description){
        throw new ApiError(400,"name or description are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        name,
        description
    }, {new: true})

    if(!playlist){
        throw new ApiError(500,"Failed to update playlist")
    }

    return res.json(new ApiResponse(200, playlist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}