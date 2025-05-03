import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticateUser } from '../middleware/auth.js';
import { verifyOwnership } from '../middleware/auth.js';
const router = express.Router();

// 🌟 User Registration
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// 🌟 User Login
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,          // ✅ for local dev
      sameSite: "Lax",        // ✅ more flexible for dev
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
        

    res.header("Authorization", `Bearer ${accessToken}`).json({
      token: accessToken,
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// 🌟 Refresh Token Route
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("Cookies received:", req.cookies);

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// 🌟 Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  
  res.json({ message: "Logged out successfully" });
});

// Add this route to your userRoutes.js file

// Update Profile Image
// Update Profile Image
router.put("/update-profile", authenticateUser, verifyOwnership, async (req, res) => {
  try {
    const { userId, profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({ message: "Profile image is required" });
    }
    
    // Validate that the profile image is a valid base64 string
    if (!/^data:image\/(jpeg|png|gif|webp);base64,/.test(profileImage)) {
      return res.status(400).json({ message: "Invalid image format" });
    }
    
    // Update user profile in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return success response with updated profile image
    res.status(200).json({
      message: "Profile updated successfully",
      profileImage: updatedUser.profileImage
    });
    
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

// Add this line in server.js when setting up routes
// app.use('/api', userRoutes);  // This ensures the endpoint is accessible at /api/update-profile

// Get Current User Profile (Using Token)
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("username email profileImage");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});



export default router;
