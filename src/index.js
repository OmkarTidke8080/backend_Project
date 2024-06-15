import mongoose from "mongoose";
import { DB_NAME } from "./constants";

// import express from "express";

// // function connectDB() {}
// const app = express();

// // ;(async () => {})();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERR", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("ERROR", error);
//     throw err;
//   }
// })();
