import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`\n Mongo DB connected !!! `);
  } catch (error) {
    console.log("MONGO DB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
