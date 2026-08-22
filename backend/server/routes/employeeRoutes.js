const express = require("express");

const {
    createProfile,
    getMyProfile,
    updateMyProfile
} = require("../controllers/employeeController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/profile", protect, createProfile);

router.get("/profile", protect, getMyProfile);

router.put("/profile", protect, updateMyProfile);

module.exports = router;