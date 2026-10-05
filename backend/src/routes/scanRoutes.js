const express = require("express");

const {
  createScan,
  getScanById,
  getScanHistory,
} = require("../controllers/scanController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// Create Privacy Scan
// POST /api/scans
// --------------------------------------------------

router.post(
  "/",
  protect,
  createScan
);

// --------------------------------------------------
// Get My Scan History
// GET /api/scans/history
// --------------------------------------------------

router.get(
  "/history",
  protect,
  getScanHistory
);

// --------------------------------------------------
// Get Single Scan
// GET /api/scans/:id
// --------------------------------------------------

router.get(
  "/:id",
  protect,
  getScanById
);

module.exports = router;