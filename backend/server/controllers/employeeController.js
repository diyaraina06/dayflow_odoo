const Employee = require("../models/Employee");

const createProfile = async (req, res) => {
    try {
        const existingProfile = await Employee.findOne({
            userId: req.user._id
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "Employee profile already exists"
            });
        }

        const employee = await Employee.create({
            userId: req.user._id,
            ...req.body
        });

        res.status(201).json({
            message: "Employee profile created successfully",
            employee
        });
    } catch (error) {
        console.error("Create profile error:", error);

        res.status(500).json({
            message: "Failed to create employee profile"
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findOne({
            userId: req.user._id
        }).populate("userId", "employeeId email role");

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        res.json(employee);
    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const allowedFields = [
            "phone",
            "address",
            "profilePicture"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const employee = await Employee.findOneAndUpdate(
            { userId: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        res.json({
            message: "Profile updated successfully",
            employee
        });
    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            message: "Failed to update profile"
        });
    }
};

module.exports = {
    createProfile,
    getMyProfile,
    updateMyProfile
};