const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req, res) => {
    res.json({
        message: "Authenticated successfully",
        user: req.user
    });
});

router.get("/hr-test", protect, authorize("hr"), (req, res) => {
    res.json({
        message: "HR authorization successful",
        user: req.user
    });
});

module.exports = router;