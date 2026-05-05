const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const urlRoutes = require("./routes/url");
const rateLimiter = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON requests
app.use(express.json());

// Apply rate limiter to all API routes
app.use("/api", rateLimiter);

// Mount routes
app.use("/api", urlRoutes);   // handles /api/shorten and /api/stats/:code
app.use("/", urlRoutes);      // handles /:code redirects

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });