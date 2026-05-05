# 🔗 URL Shortener API

A fast and lightweight URL shortening service built with Node.js, Express, MongoDB, and Redis. Inspired by services like Bitly, this API allows users to shorten long URLs, redirect via short codes, and track click analytics.

---

## 🚀 Features

- **Shorten URLs** — Generate a unique 6-character short code for any valid URL
- **Redirect** — Instantly redirect users from a short code to the original URL
- **Click Tracking** — Track how many times each short URL has been visited
- **Redis Caching** — Frequently accessed URLs are cached for faster redirects
- **Rate Limiting** — Prevents abuse by limiting requests to 10 per minute per IP
- **Duplicate Detection** — Returns the existing short code if a URL was already shortened

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Persistent data storage |
| Redis (ioredis) | Caching layer for fast redirects |
| Nanoid | Unique short code generation |
| express-rate-limit | Rate limiting middleware |

---

## 📁 Project Structure

```
url-shortener/
├── src/
│   ├── index.js                 # App entry point
│   ├── routes/
│   │   └── url.js               # Route handlers
│   ├── models/
│   │   └── Url.js               # Mongoose schema
│   ├── middleware/
│   │   └── rateLimiter.js       # Rate limiting logic
│   └── utils/
│       └── generateCode.js      # Short code generator
├── .env.example
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Redis

### Installation

```bash
# Clone the repository
git clone https://github.com/Rubinaerin/url-shortener.git
cd url-shortener

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/urlshortener
REDIS_URL=redis://localhost:6379
BASE_URL=http://localhost:3000
```

```bash
# Start the development server
npm run dev
```

---

## 📡 API Endpoints

### Shorten a URL
```
POST /api/shorten
```
**Request body:**
```json
{
  "url": "https://www.example.com/very/long/url"
}
```
**Response:**
```json
{
  "shortCode": "aB3xZ9",
  "shortUrl": "http://localhost:3000/aB3xZ9"
}
```

---

### Redirect to Original URL
```
GET /:code
```
Redirects the user to the original URL. Click count is incremented on each visit.

---

### Get Click Stats
```
GET /api/stats/:code
```
**Response:**
```json
{
  "shortCode": "aB3xZ9",
  "originalUrl": "https://www.example.com/very/long/url",
  "clicks": 42,
  "createdAt": "2026-05-05T18:30:42.576Z"
}
```

---

## 🏗 How It Works

1. User sends a long URL to `POST /api/shorten`
2. The API generates a unique 6-character code using Nanoid
3. The mapping is saved to MongoDB and cached in Redis (TTL: 24h)
4. When someone visits `/:code`, Redis is checked first for a fast lookup
5. If found, the user is redirected and the click count is incremented
6. If not in cache, the API falls back to MongoDB and re-caches the result

---

## 📄 License

MIT
