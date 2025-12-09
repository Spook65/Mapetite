import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,
  rating: Number,
  cuisine: String,
  address: String,
  priceLevel: Number,
  googlePlaceId: String,
});

export default mongoose.model("Restaurant", RestaurantSchema);
