import mongoose from "mongoose";

export const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: "TypingClash",
      });
      console.log("MongoDB connected");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
      process.exit(1);
    }
  };
