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

// Employee
router.post("/check-in", protect, authorize("employee"), checkIn);

router.post("/check-out", protect, authorize("employee"), checkOut);

router.get("/my", protect, authorize("employee"), getMyAttendance);

// HR
router.get("/all", protect, authorize("hr"), getAllAttendance);

module.exports = router;
