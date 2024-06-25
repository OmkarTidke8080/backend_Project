import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log(`\n Mongo DB connected !!! `);
  } catch (error) {
    console.log("MONGO DB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
