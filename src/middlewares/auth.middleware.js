import { asyncHandler } from "../utils/asyncHandler.js";
import jwt, { decode } from "jsonwebtoken";
import { Admin } from "../models/admin.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // console.log(req.cookies)
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      return res.json(new ApiResponse(407, "Invalid Access Token"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await Admin.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!admin && !user) {
      return res.json(new ApiResponse(407, "Invalid Access Token"));
    }

    if (admin) req.user = admin;
    else if (user) req.user = user;

    next();
  } catch (error) {
    console.log("Invalid Token");
    return res.json(new ApiResponse(407, "Invalid Access Token"));

    // throw new ApiError(402, error?.message || "Invalid access token")
  }
});

const verifyJWTAdmin = asyncHandler(async (req, res, next) => {
  try {
    // console.log(req.cookies)
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      return res.json(new ApiResponse(407, "Invalid Access Token"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await Admin.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!admin) {
      return res.json(new ApiResponse(407, "Invalid Access Token"));
    }

    req.user = admin;
    next();
  } catch (error) {
    console.log("Invalid Token");
    return res.json(new ApiResponse(407, "Invalid Access Token"));

    // throw new ApiError(402, error?.message || "Invalid access token")
  }
});

export { verifyJWT, verifyJWTAdmin };
