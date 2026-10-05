const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    console.log("========== JWT DEBUG ==========");
    console.log(
      "Authorization header exists:",
      Boolean(authHeader)
    );
    console.log(
      "Authorization header starts with Bearer:",
      authHeader?.startsWith("Bearer ")
    );

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token is required",
      });
    }

    const token =
      authHeader.substring(7).trim();

    console.log(
      "Token exists:",
      Boolean(token)
    );
    console.log(
      "Token length:",
      token.length
    );
    console.log(
      "JWT_SECRET exists:",
      Boolean(process.env.JWT_SECRET)
    );

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token is required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      "JWT verified successfully"
    );
    console.log(
      "Decoded userId:",
      decoded.userId
    );

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token",
      });
    }

    const user =
      await User.findById(
        decoded.userId
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User associated with this token no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message:
          "User account is inactive",
      });
    }

    req.user = user;

    console.log(
      "Authenticated user:",
      user.email
    );
    console.log(
      "================================"
    );

    next();
  } catch (error) {
    console.error(
      "JWT verification error:",
      error.name
    );
    console.error(
      "JWT verification message:",
      error.message
    );
    console.log(
      "================================"
    );

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token has expired",
      });
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed",
    });
  }
};

module.exports = {
  protect,
};