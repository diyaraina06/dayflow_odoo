const express = require("express");

const {
    checkIn,
    checkOut,
    getMyAttendance,
    getAllAttendance
} = require("../controllers/attendanceController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employee / HR
router.post("/check-in", protect, authorize("employee", "hr"), checkIn);

router.post("/check-out", protect, authorize("employee", "hr"), checkOut);

router.get("/my", protect, authorize("employee", "hr"), getMyAttendance);

// HR
router.get("/all", protect, authorize("hr"), getAllAttendance);

module.exports = router;
