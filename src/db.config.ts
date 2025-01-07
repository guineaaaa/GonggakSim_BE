import { PrismaClient } from "@prisma/client"; //prisma
import mongoose from "mongoose"; //mongodb
import dotenv from "dotenv";

dotenv.config();

// prisma
export const prisma = new PrismaClient({ log: ["query"] });

// mongodb
export const connectMongoDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI || "", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  };