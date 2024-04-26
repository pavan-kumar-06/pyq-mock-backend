import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uuid } from "uuidv4";
import { Attempt } from "../models/attempt.models.js";

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

const updateAttempt = asyncHandler(async (req, res) => {
  // Extract the attempt ID from the request parameters
  const { attemptId } = req.params;

  // Extract responses and score from the request body
  let { responses, score } = req.body;

  // Check if all fields are present
  if (!responses || !score) {
    return res.json(new ApiResponse(404, null, "All fields are necessary"));
  }

  // Parse score to number
  score = Number(score);

  try {
    // Find the attempt by its ID
    const attempt = await Attempt.findById(attemptId);

    // If the attempt is not found, return a 404 error
    if (!attempt) {
      return res.json(new ApiResponse(404, null, "Attempt ID does not exist"));
    }

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
