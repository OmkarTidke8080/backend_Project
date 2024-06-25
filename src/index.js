import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import userRouter from "./routes/user.Route.js";

dotenv.config({
  path: "./.env",
});

const app = express();

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
