import express from "express";
import { User, generateJWTToken } from "../Models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import isAuthenticated from "../Controller/auth.js";
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.rediffmail.com",
  port: 465,
  secure: true, // e.g., Gmail, Outlook, etc.
  auth: {
    user: "rtrvenkat1997@rediffmail.com",
    pass: "rtr@1078",
  },
});

router.post("/signup", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user = await new User({
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      password: hashedPassword,
    }).save();

    const token = generateJWTToken(user._id);

    res.status(200).json({ message: "Successfully Logged in", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ data: "Invalid Email" });
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) res.status(400).json({ data: "Invalid Password" });

    const token = generateJWTToken(user._id);
    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "Internal Server Error" });
  }
});
router.get("/all", async (req, res) => {
  const user = await User.find();
  if (!user) return res.status(400).json({ data: "User Not Found" });
  res.status(200).json({ data: user });
});

// Get user profile
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    // Retrieve the user ID from the authenticated request
    const userId = req.user._id;
    console.log(userId);
    // Find the user by ID
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract the desired information from the user object
    const { name, email, contact, templates } = user;

    // Create the user profile object
    const userProfile = {
      name,
      email,
      contact,
      templates,
    };

    // Send the user profile as the response
    res.status(200).json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/change-password", isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // Generate a hash for the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Forgot Password - Generate Reset Token
// Forgot Password - Generate Reset Token
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    // Generate reset token and expiration date
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour

    // Save the reset token and expiration date to the user object
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiration = resetTokenExpiration;
    await user.save();

    // Send the reset token to the user's email
    const mailOptions = {
      from: "sealvenki@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Please use the following token to reset your password: ${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Failed to send reset token:", error);
        return res.status(500).json({ message: "Failed to send reset token" });
      }

      res.status(200).json({ message: "Reset token generated" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Check if the reset token exists and has not expired
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Generate a hash for the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/templatesaver", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { url } = req.body;
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(url);
    user.templates.push(url);
    await user.save();
    res.status(200).json({ data: "URL Saved Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "Internal Server Error" });
  }
});

export const userRouter = router;
