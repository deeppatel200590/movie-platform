import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  description: String,
  hero: String,
  producer: String,

  poster: String,
  movieUrl: String,

  releaseDate: Date,

  price: {
    type: Number,
    required: true,
    default: 0
  },

  purchaseCount: {
    type: Number,
    default: 0
  }
});

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;