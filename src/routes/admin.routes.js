import { Router } from "express";
import {
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/admin.controller.js";
import { verifyJWTAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAdmin);
router.route("/register").post(registerAdmin);
//secured routes
router.route("/logout").post(verifyJWTAdmin, logoutAdmin);
// router.route("/refresh-token").post(refreshAccessToken)

export default router;
