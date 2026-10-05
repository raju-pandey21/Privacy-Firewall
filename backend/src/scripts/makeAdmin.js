const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dns = require("dns");

const User = require("../models/User");

dotenv.config();

// Use Cloudflare DNS for MongoDB Atlas SRV lookup
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "raju@privacyfirewall.com";

    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.log("User not found");
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`Admin role assigned to: ${user.email}`);
    console.log(`Current role: ${user.role}`);

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Failed to make admin:", error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

makeAdmin();