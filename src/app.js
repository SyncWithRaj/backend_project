import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())
app.use(morgan("dev")); // HTTP request logger middleware for mode

// TODO: Make routes and add here
// routes import
import userRouter from "./routes/user.route.js"


//routes declaration
app.use("/api/v1/users", userRouter)

export { app };
