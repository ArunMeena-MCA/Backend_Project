import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const User = await user.findById(userId) 
        const accessToken = User.generateAccessToken()
        const refreshToken = User.generateRefreshToken()

        User.refreshToken = refreshToken
        await User.save({ validateBeforeSave : false })

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // console.log(req.files);

    // get user details from frontend

    const { fullname, email, username, password } = req.body;


    // validation - non empty

    // if(fullname === ""){
    //     throw new ApiError(400,"fullname is required")
    // }
    // similarly, we have to check for all other fields also but,
    // Advance/experienced programmers do the same thing using the following code

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }



    // check if user already exists : username, email

    const existedUser = await user.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }


    // check for images, check for avatar
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;


    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    // Checking because Avatar is required field
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required...");
    }
   


    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    
    // Rechecking because Avatar is required field
    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }


    // create user object - create entry in db

    const newUser = await user.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await user.findById(newUser._id).select(
        "-password -refreshToken"
    )

    // check for user creation

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    // return response

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async(req,res) => {
    // req body se data le aao

    const {email,username,password} = req.body;

    // access based on username (or email)
    
    if(!(username || email)){
        throw new ApiError(400,"username or email is required")
    }
    
    // find the user
    
    const newUser = await user.findOne({
        $or: [{username},{email}]
    })

    if(!newUser){
        throw new ApiError(404,"User does not exist")
    }
    
    
    // password check

    const isPasswordvalid = await newUser.isPasswordCorrect(password)

    if(!isPasswordvalid){
        throw new ApiError(401,"Invalid Password")
    }


    // generate access and refresh token

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(newUser._id)

    
    // send cookie and reponse
    
    const loggedInUser = await user.findById(newUser._id).select("-password -refreshToken")
    
    const options = {
        // httpOnly: true,
        // secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "user logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await user.findByIdAndUpdate(
        req.User._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new : true
        }
    )

    const options = {
        // httpOnly: true,
        // secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200,{},"user logged out !!")
    )
})

const refreshAccessToken = asyncHandler( async (req,res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request")
        }
    
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const User = await user.findById(decodedToken?._id)
    
        if(!User){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== User?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(User._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("newRefreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {currentPassword,newPassword} = req.body;

    if(!(currentPassword || newPassword)){
        throw new ApiError(400,"currentPassword or newPassword is required")
    }

    const currentUserId = req.User?._id;
    const currentUser = await user.findById(currentUserId);
    const isPasswordvalid = await currentUser.isPasswordCorrect(currentPassword)

    if(!isPasswordvalid){
        throw new ApiError(401,"Invalid Password")
    }

    currentUser.password = newPassword;
    await currentUser.save({ validateBeforeSave : false });

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res.status(200)
    .json(
        new ApiError(200,
        req.User,
        "User fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullname,email} = req.body;

    const currentUserId = req.User?._id;
    const currentUser = await user.findById(currentUserId).select(
        "-password -refreshToken"
    )


    if(!(fullname || email)){
        throw new ApiError(400,"At least one field is required to update!");
    }

    if(fullname){
        currentUser.fullname = fullname;
    }
    if(email){
        currentUser.email = email;
    }


    await currentUser.save({validateBeforeSave: false});

    return res.status(200)
    .json(
        new ApiResponse(200, currentUser, "Details updated successfully!")
    )
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading Avatar!")
    }

    const currentUser = await user.findByIdAndUpdate(
        req.User?._id,
        {
            $set: { avatar : avatar.url }
        },
        {new: true}
    ).select( "-password" )

    return res.status(200)
    .json(
        new ApiResponse(200,currentUser,"Avatar Updated Successfully!")
    )
})


const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage file is missing!")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage!")
    }

    const currentUser = await user.findByIdAndUpdate(
        req.User?._id,
        {
            $set: { coverImage : coverImage.url }
        },
        {new: true}
    ).select( "-password" )

    return res.status(200)
    .json(
        new ApiResponse(200,currentUser,"CoverImage Updated Successfully!")
    )
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}                      