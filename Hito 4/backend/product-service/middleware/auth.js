const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("❌ No Authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) {
    console.log("❌ Token missing after split");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // must match auth-service secret
    console.log("✅ Token decoded:", decoded);

    // Ensure req.user.id is available
    req.user = { id: decoded.id || decoded._id };
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = auth;
