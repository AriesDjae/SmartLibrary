import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI ||
      "mongodb+srv://ariesdjaenuri24:<db_password>@cluster0.jhd9x35.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
