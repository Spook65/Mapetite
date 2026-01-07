// Manages the optional MongoDB connection used for flexible caching/doc storage.
// Exists to keep Mongo wiring out of route handlers and services.
// Does NOT gate core app availability; if Mongo is unavailable, callers should fall back gracefully.
import mongoose from "mongoose";

let isConnecting = false;

export const connectMongo = async (uri: string | undefined) => {
  if (!uri) {
    console.warn("[mongo] MONGODB_URI missing; skipping cache connection.");
    return;
  }
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }
  try {
    isConnecting = true;
    await mongoose.connect(uri);
    console.log("[mongo] connected");
  } catch (err) {
    console.warn("[mongo] optional connection failed; continuing without cache.", err);
  } finally {
    isConnecting = false;
  }
};

export default mongoose;

