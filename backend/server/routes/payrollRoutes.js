const express = require("express");

const {
    createPayroll,
    getMyPayroll,
    getAllPayroll
} = require("../controllers/payrollController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employee
router.get(
    "/my",
    protect,
    authorize("employee"),
    getMyPayroll
);

// HR
router.post(
    "/",
    protect,
    authorize("hr"),
    createPayroll
);

router.get(
    "/all",
    protect,
    authorize("hr"),
    getAllPayroll
);

module.exports = router;