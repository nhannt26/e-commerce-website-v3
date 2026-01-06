const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

/**
 * GET /api/addresses
 * Get all user addresses
 */
router.get("/", async (req, res) => {
  res.json({
    success: true,
    count: req.user.addresses.length,
    data: req.user.addresses,
  });
});

/**
 * POST /api/addresses
 * Add new address
 */
router.post("/", async (req, res, next) => {
  try {
    const { fullName, phone, street, city, state, zipCode, country, isDefault = false } = req.body;

    // 1. Validate required fields
    if (!fullName || !phone || !street || !city || !zipCode || !country) {
      return res.status(400).json({
        success: false,
        message: "Missing required address fields",
      });
    }

    // 2. If isDefault=true, unset others
    if (isDefault) {
      req.user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // 3. Add address
    req.user.addresses.push({
      fullName,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    });

    await req.user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: req.user.addresses[req.user.addresses.length - 1],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/addresses/:addressId
 * Update address
 */
router.put("/:addressId", async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const address = req.user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Handle isDefault logic
    if (req.body.isDefault === true) {
      req.user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Update allowed fields
    const fields = ["fullName", "phone", "street", "city", "state", "zipCode", "country", "isDefault"];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    await req.user.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/addresses/:addressId
 * Delete address
 */
router.delete("/:addressId", async (req, res, next) => {
  try {
    const { addressId } = req.params;

    if (req.user.addresses.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the only address",
      });
    }

    const address = req.user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    // Remove address
    req.user.addresses.pull(addressId);

    // If deleted address was default → set another as default
    if (wasDefault) {
      req.user.addresses[0].isDefault = true;
    }

    await req.user.save();

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/addresses/:addressId/set-default
 * Set address as default
 */
router.patch("/:addressId/set-default", async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const address = req.user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Unset all defaults
    req.user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set this one as default
    address.isDefault = true;

    await req.user.save();

    res.json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
