import { Router } from "express";
import {
  getAllTests,
  getTestById,
  createTest,
  updateTestById,
  deleteTestById,
  updateQuestionInTest,
  uploadImage,
} from "../controllers/test.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyJWTAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Test routes
router.route("/").get(verifyJWT, getAllTests).post(verifyJWTAdmin, createTest);

router
  .route("/:id")
  .get(verifyJWT, getTestById)
  .put(verifyJWTAdmin, updateTestById)
  .delete(verifyJWTAdmin, deleteTestById);

// Nested route for updating a question in a test
router
  .route("/:id/questions/:questionNumber")
  .put(verifyJWTAdmin, updateQuestionInTest);

export default router;
