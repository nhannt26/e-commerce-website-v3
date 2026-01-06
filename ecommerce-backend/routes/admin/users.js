const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth");
const User = require("../../models/User");

// All routes require admin role
router.use(protect, authorize("admin"));

/**
 * ==================================================
 * GET /api/admin/users
 * ==================================================
 */
router.get("/", async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query).select("-password").skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      results: {
        users,
        count: users.length,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ==================================================
 * GET /api/admin/stats/users
 * ==================================================
 */
router.get("/stats/users", async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const customersCount = await User.countDocuments({ role: "customer" });
    const adminsCount = await User.countDocuments({ role: "admin" });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        customersCount,
        adminsCount,
        newUsersThisMonth,
        newUsersToday,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ==================================================
 * GET /api/admin/users/:id
 * ==================================================
 */
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate({
      path: "wishlist",
      select: "name price images",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        wishlistCount: user.wishlist.length,
        addressesCount: user.addresses?.length || 0,
        // orderCount: 0 // TODO: add when Order model ready
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ==================================================
 * PATCH /api/admin/users/:id/activate
 * ==================================================
 */
router.patch("/:id/activate", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User activated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ==================================================
 * PATCH /api/admin/users/:id/deactivate
 * ==================================================
 */
router.patch("/:id/deactivate", async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deactivated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ==================================================
 * PATCH /api/admin/users/:id/role
 * ==================================================
 */
router.patch("/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User role updated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ==================================================
 * DELETE /api/admin/users/:id (Soft delete)
 * ==================================================
 */
router.delete("/:id", async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deactivated (soft delete)",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;