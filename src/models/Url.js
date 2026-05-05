const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    // The original long URL provided by the user
    originalUrl: {
      type: String,
      required: true,
    },

    // The generated short code (e.g. "aB3xZ9")
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for faster lookups
    },

    // Number of times this short URL has been clicked
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Url", urlSchema);