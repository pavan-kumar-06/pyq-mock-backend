import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import collegeRouter from "./routes/college.routes.js";
import testRouter from "./routes/test.routes.js";
import attemptRouter from "./routes/attempt.routes.js";
import { verifyJWTAdmin } from "./middlewares/auth.middleware.js";
import { uploadImage, deleteImage } from "./controllers/test.controller.js";
import { upload } from "./middlewares/multer.middleware.js";

//routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/college", collegeRouter);
app.use("/api/v1/test", testRouter);
app.use("/api/v1/attempt", attemptRouter);
app.post("/api/v1/image", verifyJWTAdmin, upload.single("image"), uploadImage);
app.delete("/api/v1/image", verifyJWTAdmin, deleteImage);

app.get("/api/health", async (_req, res, _next) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).send();
  }
});

// http://localhost:8000/api/v1/users/register

export { app };
