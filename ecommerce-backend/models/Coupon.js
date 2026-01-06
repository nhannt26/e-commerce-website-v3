const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      // min: 0,
      set: (v) => Number(v),
    },

    minimumPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumDiscount: {
      type: Number, // only for percentage
      // min: 0,
      set: (v) => (v == null ? undefined : Number(v)),
    },

    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number, // total usage
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
