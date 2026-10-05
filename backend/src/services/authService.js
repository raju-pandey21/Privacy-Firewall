const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not defined in .env file"
    );
  }

  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const registerUser = async ({
  name,
  email,
  password,
}) => {
  const normalizedEmail =
    email.trim().toLowerCase();

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

const loginUser = async ({
  email,
  password,
}) => {
  const normalizedEmail =
    email.trim().toLowerCase();

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");

  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }

  if (!user.isActive) {
    throw new Error(
      "User account is inactive"
    );
  }

  const isPasswordCorrect =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordCorrect) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};