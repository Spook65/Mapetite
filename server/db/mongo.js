// Optional MongoDB connector for Node/Express (JS) code paths.
// Exists to keep Mongo setup centralized and non-fatal if the cache is down.
// Does NOT gate server startup; all failures are logged as warnings only.
import mongoose from "mongoose";
import logger from "../config/logger.js";

let isConnecting = false;

export const connectMongo = async (uri) => {
  if (!uri) {
    logger.warn("MONGODB_URI/MONGO_URI missing; skipping cache connection.");
    return;
  }
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }
  try {
    isConnecting = true;
    await mongoose.connect(uri);
    logger.info("MongoDB connected", { host: mongoose.connection.host });
  } catch (err) {
    logger.warn("MongoDB connection failed; continuing without cache.", {
      message: err?.message,
    });
  } finally {
    isConnecting = false;
  }
};

export default mongoose;



