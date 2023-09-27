import mongoose from "mongoose";

let isConnected = false; // variable to check if connection is already established

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL)
    return console.log("MONGODB_URL not found in .env file");
  if (isConnected) return console.log("Already connected to DB");

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Connected to MongoDB")
  } catch (err) {
    console.log("Error connecting to MongoDB", err);
  }
};
