const { customAlphabet } = require("nanoid");

// Use only URL-safe characters to avoid confusion
const alphabet =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Generate a 6-character unique short code
const generateCode = customAlphabet(alphabet, 6);

module.exports = generateCode;