import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uuid } from "uuidv4";
import { Attempt } from "../models/attempt.models.js";
import { Test } from "../models/test.models.js";
import mongoose from "mongoose";

const getAttempt = asyncHandler(async (req, res) => {
  // Extract the test ID from the request parameters
  const userId = req.user?._id;
  if (!userId) {
    return res.json(new ApiResponse(407, null, "Error while attempt creation"));
  }
  const { testId } = req.params;

  // Find if there is an attempt already exists
  const attempt = await Attempt.findOne({ userId, testId });

  // If the test is not found, throw a 404 error
  //here i am creating new attempt once check
  if (attempt) {
    return res.json(
      new ApiResponse(200, attempt, "Created Attempt successfully")
    );
  }

  const createdAttempt = await Attempt.create({
    userId,
    testId,
  });
  return res.json(
    new ApiResponse(true, createdAttempt, "Attempt created successfully")
  );
});

async function findScore(responses, testId) {
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    // If testId is not a valid ObjectId, return an error or handle it accordingly
    return null;
  }

  const test = await Test.findById(testId);
  if (!test) return null;
  const { questions } = test;
  if (responses.length > questions.length) return undefined;
  let score = 0;

  responses.forEach((response, index) => {
    const question = questions[index];
    const correctAnswer = Number(question.correctAnswer);

    if (response === null || response === "") {
      // If response is null or empty, treat as unattempted
      score += 0;
    } else {
      response = Number(response);
      if (question.questionType === "mcq") {
        // For MCQs
        if (response == 0) {
          score += 0;
        } else if (response === correctAnswer) {
          score += 4; // Correct answer
        } else {
          score -= 1; // Wrong answer
        }
      } else if (question.questionType === "numerical") {
        // For numerical questions
        if (response === correctAnswer) {
          score += 4; // Correct answer
        } else {
          score -= 1; // Wrong answer
        }
      }
    }
  });
  // console.log(score);
  return Number(score);
}

const updateAttempt = asyncHandler(async (req, res) => {
  // Extract the attempt ID from the request parameters
  const { attemptId } = req.params;

  // Extract responses and score from the request body
  let { responses } = req.body;

  // Check if all fields are present
  if (!responses) {
    return res.json(new ApiResponse(404, null, "Response is necessary"));
  }

  try {
    // Find the attempt by its ID
    const attempt = await Attempt.findById(attemptId);

    // If the attempt is not found, return a 404 error
    if (!attempt) {
      return res.json(new ApiResponse(404, null, "Attempt ID does not exist"));
    }

    //find score
    let score = await findScore(responses, attempt?.testId);
    // Parse score to number
    if (score === null) {
      return res.json(new ApiResponse(404, null, "Test ID does not exist"));
    }
    if (score === undefined) {
      return res.json(
        new ApiResponse(404, null, "Please send correct responses")
      );
    }
    score = Number(score);

    // Update the attempt with the new score and responses
    attempt.responses = responses;
    attempt.score = score;

    // Save the updated attempt
    const updatedAttempt = await attempt.save();

    // Return the updated attempt document in the response
    return res.json(
      new ApiResponse(200, updatedAttempt, "Attempt recorded successfully")
    );
  } catch (error) {
    // Handle errors
    console.error("Error while updating attempt:", error);
    return res.json(
      new ApiResponse(500, null, "Error while updating the attempt")
    );
  }
});

export { getAttempt, updateAttempt };
