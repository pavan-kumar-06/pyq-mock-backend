import { Router } from "express";
import {
    createTest,
    getAllTests,
    getTestById,
    updateTest,
    deleteTest
} from "../controllers/test.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

//secured routes only by admin
router.route("/")
    .get(verifyJWT, getAllTests)
    .post(verifyJWT, createTest);

//need to see how do i upload multiple images with different key names 
router.route("/:id")
    .get(verifyJWT, getTestById)
    .put(verifyJWT, updateTest)
    .delete(verifyJWT, deleteTest);

export default router