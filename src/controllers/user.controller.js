import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend

    const { fullname, email, username, password } = req.body


    // validation - non empty

    // if(fullname === ""){
    //     throw new ApiError(400,"fullname is required")
    // }
    // similarly, we have to check for all other fields also but,
    // Advance/experienced programmers do the same thing using the following code

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }



    // check if user already exists : username, email

    const existedUser = await user.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }



    // check for images, check for avatar

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // Checking because Avatar is required field
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required...")
    }

    console.log(avatarLocalPath);

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
        username: user.toLowerCase()
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

export { registerUser }