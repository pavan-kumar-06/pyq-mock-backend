import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadS3 , deleteS3} from "../utils/s3.js";
import { uuid } from 'uuidv4';
import { Test } from "../models/test.models.js";
import { basename } from 'path';

const getAllTests = asyncHandler(async (req, res) => {
    // Fetch all tests from the database, excluding the 'questions' field
    const tests = await Test.find({}, { questions: 0 });

    // Return the tests in the response
    res.json(new ApiResponse(true, "All tests retrieved successfully", tests));
});

const getTestById = asyncHandler(async (req, res) => {
    // Extract the test ID from the request parameters
    const { id } = req.params;

    // Find the test by its ID
    const test = await Test.findById(id);

    // If the test is not found, throw a 404 error
    if (!test) {
        throw new ApiError(404, "Test not found");
    }
    // Loop through the questions array and update URLs if the format is 'image'
    const updatedQuestions = test.questions.map(question => {
        if (question && question.questionFormat === 'image') {
            question.question = process.env.CLOUDFRONT_DISTRIBUTION_URL + question.question;
        }
        if (question && question.solutionFormat === 'image') {
            question.solution = process.env.CLOUDFRONT_DISTRIBUTION_URL + question.solution;
        }
        return question;
    });

    // Update the questions array in the test
    test.questions = updatedQuestions;

    // Return the updated test as a response
    res.json(new ApiResponse(true, "Test retrieved successfully", test));
});

const createTest = asyncHandler(async (req, res) => {
    // Extract necessary fields from the request body, excluding questions
    const { testName, testType, testYear, testDuration, totalQuestions } = req.body;

    // Initialize the questions array with null values based on totalQuestions
    const questions = new Array(totalQuestions).fill(null);

    // Create a new test with the initialized questions array and other necessary fields
    const test = await Test.create({
        testName,
        testType,
        testYear,
        testDuration,
        totalQuestions,
        questions
    });

    // Return the newly created test in the response
    res.status(201).json(new ApiResponse(true, "Test created successfully", test));
});

const updateTestById = asyncHandler(async (req, res) => {
    // Extract required fields from the request body
    const { testName, testType, testYear, testDuration, totalQuestions } = req.body;

    // Check if any of the required fields are missing in the request body
    if (!testName || !testType || !testYear || !testDuration || !totalQuestions) {
        return res.status(400).json(new ApiResponse(false, "Missing required fields"));
    }

    // Create an object with the fields to be updated
    const updateFields = {
        testName,
        testType,
        testYear,
        testDuration,
        totalQuestions
    };

    // Find and update the test document by ID
    const updatedTest = await Test.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    // If the test is not found, return a 404 response
    if (!updatedTest) {
        return res.status(404).json(new ApiResponse(false, "Test not found"));
    }

    // Return the updated test document in the response
    res.json(new ApiResponse(true, "Test updated successfully", updatedTest));
});

const deleteTestById = asyncHandler(async (req, res) =>{
    //we need to delete all s3 images also 
    // Retrieve the test details by its ID from the database
    const test = await Test.findById(req.params.id);
    if (!test) {
        throw new ApiError(404, "Test not found");
    }

    // Extract the URLs of all images associated with the test
    const imageUrls = [];
    test.questions.forEach(question => {
        if (question && question.questionFormat === 'image' && question.question) {
            imageUrls.push(question.question);
        }
        if (question && question.solutionFormat === 'image' && question.question) {
            imageUrls.push(question.solution);
        }
    });

    // Delete each image from the S3 bucket
    await Promise.all(imageUrls.map(async imageUrl => {
        try {
            await deleteS3(process.env.BUCKET_NAME_QUESTIONS,imageUrl); // Assuming you have a deleteS3 function
        } catch (error) {
            console.error("Error deleting image from S3:", error);
        }
    }));

    // Delete the test from the database
    const deletedTest = await Test.findByIdAndDelete(req.params.id);

    res.json(new ApiResponse(true, "Test deleted successfully",deletedTest));
})

const updateQuestionInTest = asyncHandler(async (req, res) =>{
    const { id, questionNumber } = req.params;
    const { questionType, question, questionFormat, solution, solutionFormat, correctAnswer, subject } = req.body;

    const test = await Test.findById(id);
    // Find the question within the test based on the questionNumber
    const questionIndex = parseInt(questionNumber) - 1;
    if (questionIndex < 0 || questionIndex >= test.questions.length) {
        throw new ApiError(404, "Question not found in the test");
    }

    // Update the question with the new data
    const updatedQuestion = {
        questionType,
        question,
        questionFormat,
        solution,
        solutionFormat,
        correctAnswer,
        subject
    };

    // Update the question within the test directly in the database using findByIdAndUpdate
    const updatedTest = await Test.findByIdAndUpdate(
        id,
        { $set: { [`questions.${parseInt(questionNumber) - 1}`]: updatedQuestion } },
        { new: true } // Return the modified document after update
    );

    // Check if the test exists
    if (!updatedTest) {
        throw new ApiError(404, "Test not found");
    }

    // Return the updated test as a response
    res.json(new ApiResponse(true, "Question updated successfully", updatedQuestion));
})

const uploadImage = asyncHandler(async(req, res) => {
    // console.log(req.file)
    const localPath = req.file?.path
    const bucketName = process.env.BUCKET_NAME_QUESTIONS

    if (!localPath) {
        throw new ApiError(400, "file is missing")
    }

    //TODO: delete old image - assignment
    const fileName = uuid()+".png";

    //store this url in the database
    const url = process.env.CLOUDFRONT_DISTRIBUTION_URL+fileName;
    console.log(url);

    const photo = await uploadS3(localPath,bucketName,fileName, req.file?.mimetype)
    console.log(photo)
    if (!photo.ETag) {
        throw new ApiError(400, "Error while uploading on photo")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, fileName)
    )
})

const deleteImage = asyncHandler(async(req, res) => {
    const bucketName = process.env.BUCKET_NAME_QUESTIONS

    //TODO: delete old image - assignment
    const {url} = req.body;
    const file =  basename(url);
    // console.log(file);

    const photo = await deleteS3(bucketName,file)
    // console.log(photo)
    // if (!photo.ETag) {
    //     throw new ApiError(400, "Error while uploading on photo")
    // }

    // const user = await User.findByIdAndUpdate(
    //     req.user?._id,
    //     {
    //         $set:{
    //             photo: photo.url
    //         }
    //     },
    //     {new: true}
    // ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, 
            "Image deleted successfully"
        )
    )
})

export {
    getAllTests,
    getTestById,
    createTest,
    updateTestById,
    deleteTestById,
    updateQuestionInTest,
    uploadImage,
    deleteImage
}