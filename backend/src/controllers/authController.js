const {
  registerUser,
  loginUser,
} = require("../services/authService");

// --------------------------------------------------
// Register
// --------------------------------------------------

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const result = await registerUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Register failed:",
      error.message
    );

    if (
      error.message ===
      "User with this email already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// --------------------------------------------------
// Login
// --------------------------------------------------

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error(
      "Login failed:",
      error.message
    );

    if (
      error.message ===
        "Invalid email or password" ||
      error.message ===
        "User account is inactive"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// --------------------------------------------------
// Get Current Logged-in User
// --------------------------------------------------

const getMe = async (req, res, next) => {
  try {
    // authMiddleware already verified the user
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};