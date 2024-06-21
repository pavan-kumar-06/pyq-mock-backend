import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAttempt,
  updateAttempt,
} from "../controllers/attempt.controller.js";

const router = Router();

//secured routes
// router.route("/:testId").get(verifyJWT, getAttempt);
router.route("/:testId").post(verifyJWT, updateAttempt);

export default router;
