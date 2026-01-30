const router = require("express").Router();
const recommendationController = require("../controllers/recommendationController");
const { protect } = require("../middleware/auth");

// GET /api/recommendation/item-cf/:userId - Get item-based collaborative filtering recommendations for a user
router.get("/item-cf/:userId", protect, recommendationController.getItemCF);

module.exports = router;