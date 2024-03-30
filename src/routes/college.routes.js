import { Router } from "express";
import {
    createCollege,
    getAllColleges,
    getCollegeById,
    updateCollegeById,
    deleteCollegeById
} from "../controllers/college.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

//secured routes only by admin
router.route("/")
    .get(verifyJWT, getAllColleges)
    .post(verifyJWT, createCollege);

router.route("/:id")
    .get(verifyJWT, getCollegeById)
    .put(verifyJWT, updateCollegeById)
    .delete(verifyJWT, deleteCollegeById);

export default router