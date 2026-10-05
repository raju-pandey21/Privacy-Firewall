const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dns = require("dns");

const User = require("../models/User");

dotenv.config();

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const user = await User.findOne({
      email: "raju@privacyfirewall.com",
    }).select("+password");

    if (!user) {
      console.log("User not found");
    } else {
      console.log("User found");
      console.log("Name:", user.name);
      console.log("Email:", user.email);
      console.log("Role:", user.role);
      console.log("Active:", user.isActive);
      console.log("Password hash exists:", Boolean(user.password));
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Failed to check user:", error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

checkUser();