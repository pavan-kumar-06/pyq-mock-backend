import { Router } from "express";
import {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollegeById,
  deleteCollegeById,
} from "../controllers/college.controller.js";
import { verifyJWT, verifyJWTAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes only by admin
router
  .route("/")
  .get(verifyJWTAdmin, getAllColleges)
  .post(verifyJWTAdmin, createCollege);

router
  .route("/:id")
  .get(verifyJWTAdmin, getCollegeById)
  .put(verifyJWTAdmin, updateCollegeById)
  .delete(verifyJWTAdmin, deleteCollegeById);

export default router;
