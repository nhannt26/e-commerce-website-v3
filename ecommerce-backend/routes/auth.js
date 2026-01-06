const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const crypto = require("crypto");

/* ======================================================
   POST /api/auth/register – Customer registration
====================================================== */
router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // 1. Validate input
    if (!firstName || firstName.length < 2 || firstName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "First name must be between 2 and 50 characters",
      });
    }

    if (!lastName || lastName.length < 2 || lastName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Last name must be between 2 and 50 characters",
      });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // 2. Check if email exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 3. Create user (password auto-hashed)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    // 4. Generate token
    const token = user.generateAuthToken();

    // 5. Response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    next(error);
  }
});

/* ======================================================
   POST /api/auth/login – Customer login
====================================================== */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // 2. Find user (include password)
    const user = await User.findByEmail(email).select("+password");

    // 3. Check user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Check account active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    // 5. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 6. Update last login
    await user.updateLastLogin();

    // 7. Generate token
    const token = user.generateAuthToken();

    // 8. Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   GET /api/auth/me – Get current user (Protected)
====================================================== */
router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.getPublicProfile(),
  });
});

/* ======================================================
   PUT /api/auth/update-profile – Update profile
====================================================== */
router.put("/update-profile", protect, async (req, res, next) => {
  try {
    const allowedFields = ["firstName", "lastName", "phone", "dateOfBirth", "preferences"];

    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   POST /api/auth/change-password – Change password
====================================================== */
router.post("/change-password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password (auto-hashed)
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   POST /api/auth/forgot-password
====================================================== */
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Security: không tiết lộ email có tồn tại
      return res.status(200).json({
        success: true,
        message: "If email exists, reset token has been sent",
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Trong app thật: gửi email
    // Ở đây return token cho test
    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken,
      expiresIn: "10 minutes",
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   POST /api/auth/reset-password/:token
====================================================== */
router.post("/reset-password/:token", async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   POST /api/auth/send-verification
====================================================== */
router.post("/send-verification", protect, async (req, res, next) => {
  try {
    if (req.user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    const user = await User.findById(req.user._id);

    const token = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Real app: send email
    res.status(200).json({
      success: true,
      message: "Verification email sent",
      verificationToken: token,
      expiresIn: "24 hours",
    });
  } catch (error) {
    next(error);
  }
});

/* ======================================================
   GET /api/auth/verify-email/:token
====================================================== */
router.get("/verify-email/:token", async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
