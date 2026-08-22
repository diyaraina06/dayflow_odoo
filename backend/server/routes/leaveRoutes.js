const express = require("express");

const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
} = require("../controllers/leaveController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employee
router.post(
    "/",
    protect,
    authorize("employee"),
    applyLeave
);

router.get(
    "/my",
    protect,
    authorize("employee"),
    getMyLeaves
);

// HR
router.get(
    "/all",
    protect,
    authorize("hr"),
    getAllLeaves
);

router.put(
    "/:id/status",
    protect,
    authorize("hr"),
    updateLeaveStatus
);

module.exports = router;