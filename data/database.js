import mongoose from "mongoose";

export const connectDB = async () => {
    try {
      await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
      console.log(`MongoDB connected with host ${mongoose.connection.host}`);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
      process.exit(1);
    }
  };
