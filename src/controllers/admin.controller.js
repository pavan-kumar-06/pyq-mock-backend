import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadS3, deleteS3 } from "../utils/s3.js";
import jwt from "jsonwebtoken"
import { uuid } from 'uuidv4';
import { Admin } from "../models/admin.models.js";

// const uploadImage = asyncHandler(async(req, res) => {
//     // console.log(req.file)
//     const localPath = req.file?.path
//     const bucketName = process.env.BUCKET_NAME_QUESTIONS

//     if (!localPath) {
//         throw new ApiError(400, "file is missing")
//     }

//     //TODO: delete old image - assignment
//     const fileName = uuid()+".png";

//     //store this url in the database
//     const url = process.env.CLOUDFRONT_DISTRIBUTION_URL+fileName;
//     console.log(url);

//     const photo = await uploadS3(localPath,bucketName,fileName, req.file?.mimetype)
//     console.log(photo)
//     if (!photo.ETag) {
//         throw new ApiError(400, "Error while uploading on photo")
//     }

//     // const user = await User.findByIdAndUpdate(
//     //     req.user?._id,
//     //     {
//     //         $set:{
//     //             photo: photo.url
//     //         }
//     //     },
//     //     {new: true}
//     // ).select("-password")

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, 
//             {
//                 url: process.env.CLOUDFRONT_DISTRIBUTION_URL+fileName, 
//             },
//             "Image updated successfully"
//         )
//     )
// })

// const deleteImage = asyncHandler(async(req, res) => {
//     const bucketName = process.env.BUCKET_NAME_QUESTIONS

//     //TODO: delete old image - assignment
//     const {url} = req.body;

//     console.log(url);

//     const photo = await deleteS3(bucketName,url)
//     console.log(photo)
//     // if (!photo.ETag) {
//     //     throw new ApiError(400, "Error while uploading on photo")
//     // }

//     // const user = await User.findByIdAndUpdate(
//     //     req.user?._id,
//     //     {
//     //         $set:{
//     //             photo: photo.url
//     //         }
//     //     },
//     //     {new: true}
//     // ).select("-password")

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, 
//             "Image deleted successfully"
//         )
//     )
// })

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const admin = await Admin.findById(userId)
        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken
        await admin.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerAdmin = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { username, password } = req.body
    console.log(username,password);

    if (
        [username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedAdmin = await Admin.findOne({
        username
    })

    if (existedAdmin) {
        throw new ApiError(409, "Admin with username already exists")
    }   

    const admin = await Admin.create({
        password,
        username: username.toLowerCase()
    })

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    )

    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering the admin")
    }

    return res.status(201).json(
        new ApiResponse(200, createdAdmin, "Admin registered Successfully")
    )
} )

const loginAdmin = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {username, password} = req.body

    if (!username) {
        throw new ApiError(400, "username is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const admin = await Admin.findOne({
        username
    })

    if (!admin) {
        return res
        .json(new ApiResponse(401, {}, "Wrong Username"))
    
    }

   const isPasswordValid = await admin.isPasswordCorrect(password)

   if (!isPasswordValid) {
    return res
    .json(new ApiResponse(401, {}, "Password Incorrect"))
}

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(admin._id)

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                loggedInAdmin, accessToken, refreshToken
            },
            "Admin logged In Successfully"
        )
    )

})

const logoutAdmin = asyncHandler(async(req, res) => {
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const admin = await Admin.findById(decodedToken?._id)
    
        if (!admin) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== admin?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(admin._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken,
}