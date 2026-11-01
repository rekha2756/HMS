
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const publicKey = fs.readFileSync(
  path.join(__dirname, "../keys/public_key.pem"),
  "utf8"
);

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authorization token is required"
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Token is missing"
    });
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"]
    });

    // Validate token payload
    if (!decoded.userId || !decoded.role || !decoded.tenantId) {
      return res.status(403).json({
        error: "Invalid token payload"
      });
    }

    // Check tenant consistency
    if (req.tenantId && decoded.tenantId !== req.tenantId) {
      return res.status(403).json({
        error: "Tenant mismatch"
      });
    }

    req.user = decoded;

    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Access token expired"
      });
    }

    return res.status(403).json({
      error: "Invalid token"
    });
  }
};
