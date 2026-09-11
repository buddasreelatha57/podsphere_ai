import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./src/models/User";

const createAdmin = async () => {
  try {
    await mongoose.connect("mongodb+srv://PodUser:PodSphere123@cluster0.u5u1ymi.mongodb.net/podsphere?retryWrites=true&w=majority&appName=Cluster0");
    
    const hashedPassword = await bcrypt.hash("sree@123", 10);
    
    let user = await User.findOne({ email: "sree@podsphereai.in" });
    if (user) {
      user.password = hashedPassword;
      user.role = "admin";
      await user.save();
      console.log("Admin user updated successfully");
    } else {
      await User.create({
        name: "Admin",
        email: "sree@podsphereai.in",
        password: hashedPassword,
        role: "admin",
        isVerified: true
      });
      console.log("Admin user created successfully");
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

createAdmin();
