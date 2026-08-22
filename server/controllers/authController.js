const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
    try {
        const { employeeId, email, password, role } = req.body;

        if (!employeeId || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!["employee", "hr"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { employeeId }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email or employee ID already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            employeeId,
            email,
            password: hashedPassword,
            role,
            isEmailVerified: false
        });

        res.status(201).json({
            message: "Registration successful. Please verify your email.",
            user: {
                id: user._id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login"
        });
    }
};

module.exports = {
    register,
    login
};