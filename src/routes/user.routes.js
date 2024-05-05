import { Router } from "express";
import {
  getHistory,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/history").get(verifyJWT, getHistory);

export default router;
