const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dns = require("dns");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

dotenv.config();

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "raju@privacyfirewall.com";
    const newPassword = "Raju@12345";

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("USER_NOT_FOUND");
      await mongoose.connection.close();
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;

    await user.save();

    const updatedUser = await User.findOne({ email }).select("+password");

    const passwordMatches = await bcrypt.compare(
      newPassword,
      updatedUser.password
    );

    console.log("PASSWORD_RESET_SUCCESS");
    console.log("Email:", updatedUser.email);
    console.log("Role:", updatedUser.role);
    console.log("Active:", updatedUser.isActive);
    console.log("Password match:", passwordMatches);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Password reset failed:", error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

resetPassword();