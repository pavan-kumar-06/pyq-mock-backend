import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { College } from "../models/college.models.js";

const createCollege = asyncHandler(async (req, res) => {
    console.log(req.body)
    const college = await College.create(req.body);
    res.status(201).json(new ApiResponse(true, "College created successfully", college));
});

const getAllColleges = asyncHandler(async (req, res) => {
    const colleges = await College.find();
    res.json(new ApiResponse(true, "Colleges retrieved successfully", colleges));
});

const getCollegeById = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id);
    if (!college) {
        return res.status(404).json(new ApiResponse(false, "College not found"));
    }
    res.json(new ApiResponse(true, "College retrieved successfully", college));
});

const updateCollegeById = asyncHandler(async (req, res) => {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!college) {
        return res.status(404).json(new ApiResponse(false, "College not found"));
    }
    res.json(new ApiResponse(true, "College updated successfully", college));
});

const deleteCollegeById = asyncHandler(async (req, res) => {
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) {
        return res.status(404).json(new ApiResponse(false, "College not found"));
    }
    res.json(new ApiResponse(true, "College deleted successfully", college));
});

export {
    createCollege,
    getAllColleges,
    getCollegeById,
    updateCollegeById,
    deleteCollegeById
};
