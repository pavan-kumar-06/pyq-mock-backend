import { Router } from "express";
import {loginAdmin,logoutAdmin,refreshAccessToken,registerAdmin} from "../controllers/admin.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/login").post(loginAdmin)
router.route("/register").post(registerAdmin)
//secured routes
router.route("/logout").post(verifyJWT,  logoutAdmin)
router.route("/refresh-token").post(refreshAccessToken)

export default router