import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import userRouter from "./routes/user.Route.js";
// import authRoutes from "./routes/auth.js";
import refreshTokenRoutes from "./routes/refreshToken.js";

dotenv.config({
  path: "./.env",
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api", authRoutes);
// app.use("/api/refreshToken", refreshTokenRoutes);

// routes declaration
app.use("/api/v1/users", userRouter);
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
