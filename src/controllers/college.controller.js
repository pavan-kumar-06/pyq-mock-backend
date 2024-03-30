import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { College } from "../models/college.models.js";






export {
    createCollege,
    getAllColleges,
    updateCollege,
    deleteCollege
}