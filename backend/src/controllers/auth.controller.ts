import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";

// =======================
// Register User
// =======================
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const { password: _, ...userData } = user.toObject();

return res.status(201).json({
  success: true,
  message: "User Registered Successfully",
  user: userData,
});
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// Login User
// =======================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }

    // Compare password
    // Debug
console.log("Email:", email);
console.log("Entered Password:", password);
console.log("Stored Hash:", user.password);

// Compare password
const isMatch = await bcrypt.compare(password, user.password);

console.log("Password Match:", isMatch);

if (!isMatch) {
  return res.status(400).json({
    success: false,
    message: "Invalid Password",
  });
}

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

   const { password: _, ...userData } = user.toObject();

return res.status(200).json({
    success: true,
    message: "Login Successful",
    token,
    user: userData,
});
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// Get Profile
// =======================
export const profile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// Google OAuth (frontend provides Google user info)
// =======================
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { name, email, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // create a new user with a random password
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
        avatar: avatar || "",
        isVerified: true,
      });
    } else {
      // update avatar/name if provided
      let changed = false;
      if (name && user.name !== name) {
        user.name = name;
        changed = true;
      }
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    const { password: _, ...userData } = user.toObject();

    return res.status(200).json({ success: true, token, user: userData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =======================
// Guest Login
// =======================
export const guestLogin = async (req: Request, res: Response) => {
  try {
    // Generate JWT for a guest
    const token = jwt.sign(
      {
        id: "guest",
        role: "guest",
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    const guestUser = {
      _id: "guest",
      name: "Guest Explorer",
      email: "guest@podsphere.ai",
      role: "guest",
      avatar: "",
      isVerified: false,
      followers: [],
      following: [],
      watchHistory: [],
    };

    return res.status(200).json({
      success: true,
      message: "Guest Login Successful",
      token,
      user: guestUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};