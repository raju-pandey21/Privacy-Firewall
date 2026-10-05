const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dns = require("dns");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

dotenv.config();

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const verifyPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "raju@privacyfirewall.com";
    const password = "Raju@12345";

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("USER_NOT_FOUND");
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log("USER_FOUND");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Active:", user.isActive);
    console.log("Password hash exists:", Boolean(user.password));

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("PASSWORD_MATCH:", isMatch);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Verification failed:", error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

verifyPassword();