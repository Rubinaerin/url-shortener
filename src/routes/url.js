const express = require("express");
const router = express.Router();
const Url = require("../models/Url");
const generateCode = require("../utils/generateCode");
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

// Helper: basic URL format validation
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// POST /api/shorten — Accept a long URL and return a short one
router.post("/shorten", async (req, res) => {
  const { url } = req.body;

  // Validate input
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Please provide a valid URL." });
  }

  try {
    // Check if this URL was already shortened
    const existing = await Url.findOne({ originalUrl: url });
    if (existing) {
      return res.status(200).json({
        shortCode: existing.shortCode,
        shortUrl: `${process.env.BASE_URL}/${existing.shortCode}`,
      });
    }

    // Generate a unique short code
    const shortCode = generateCode();

    // Save to MongoDB
    const newUrl = await Url.create({ originalUrl: url, shortCode });

    // Cache the mapping in Redis for fast redirects (TTL: 24 hours)
    await redis.set(shortCode, url, "EX", 86400);

    return res.status(201).json({
      shortCode: newUrl.shortCode,
      shortUrl: `${process.env.BASE_URL}/${newUrl.shortCode}`,
    });
  } catch (err) {
    console.error("Error shortening URL:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/stats/:code — Return click stats for a short code
router.get("/stats/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const record = await Url.findOne({ shortCode: code });

    if (!record) {
      return res.status(404).json({ error: "Short URL not found." });
    }

    return res.status(200).json({
      shortCode: record.shortCode,
      originalUrl: record.originalUrl,
      clicks: record.clicks,
      createdAt: record.createdAt,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET /:code — Redirect to original URL
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    // Check Redis cache first (faster than MongoDB)
    const cachedUrl = await redis.get(code);

    if (cachedUrl) {
      // Increment click count in background, don't block the redirect
      Url.updateOne({ shortCode: code }, { $inc: { clicks: 1 } }).exec();
      return res.redirect(cachedUrl);
    }

    // Fall back to MongoDB if not in cache
    const record = await Url.findOne({ shortCode: code });

    if (!record) {
      return res.status(404).json({ error: "Short URL not found." });
    }

    // Re-cache for future requests
    await redis.set(code, record.originalUrl, "EX", 86400);

    // Increment click count
    record.clicks += 1;
    await record.save();

    return res.redirect(record.originalUrl);
  } catch (err) {
    console.error("Error during redirect:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;