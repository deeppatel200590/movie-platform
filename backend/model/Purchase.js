import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true
  },

  paymentId: {
    type: String,
    required: true
  },

  orderId: {
    type: String
  },

  amount: Number,

  status: {
    type: String,
    default: "success"
  }
}, { timestamps: true });

export default mongoose.model("Purchase", purchaseSchema);