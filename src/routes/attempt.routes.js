import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router.route("/").get(verifyJWT, logoutAdmin);

export default router;
