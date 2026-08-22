const express = require("express");

const {
    createProfile,
    getMyProfile,
    updateMyProfile,
    getAllEmployees,
    updateLeaveBalance,
    assignHR,
    dropHR
} = require("../controllers/employeeController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/profile", protect, createProfile);

router.get("/profile", protect, getMyProfile);

router.put("/profile", protect, updateMyProfile);

// HR routes
router.get("/all", protect, authorize("hr"), getAllEmployees);
router.put("/:id/leave-balance", protect, authorize("hr"), updateLeaveBalance);
router.put("/:id/assign-hr", protect, authorize("hr"), assignHR);
router.put("/:id/drop-hr", protect, authorize("hr"), dropHR);

module.exports = router;