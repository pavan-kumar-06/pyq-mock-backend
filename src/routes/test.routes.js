import { Router } from "express";
import {
    getAllTests,
    getTestById,
    createTest,
    updateTestById,
    deleteTestById,
    updateQuestionInTest,
    uploadImage
} from '../controllers/test.controller.js';
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// Test routes
router.route('/')
    .get(verifyJWT, getAllTests)
    .post(verifyJWT, createTest);

router.route('/:id')
    .get(verifyJWT, getTestById)
    .put(verifyJWT, updateTestById)
    .delete(verifyJWT, deleteTestById);

// Nested route for updating a question in a test
router.route('/:id/questions/:questionNumber')
    .put(verifyJWT, updateQuestionInTest);

export default router;