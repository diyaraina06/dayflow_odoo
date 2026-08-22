const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

const applyLeave = async (req, res) => {
    try {
        const {
            leaveType,
            startDate,
            endDate,
            reason
        } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({
                message: "All leave fields are required"
            });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                message: "Start date cannot be after end date"
            });
        }

        const employee = await Employee.findOne({
            userId: req.user._id
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        const leave = await Leave.create({
            employeeId: employee._id,
            leaveType,
            startDate,
            endDate,
            reason
        });

        res.status(201).json({
            message: "Leave application submitted successfully",
            leave
        });
    } catch (error) {
        console.error("Apply leave error:", error);

        res.status(500).json({
            message: "Failed to apply for leave"
        });
    }
};

const getMyLeaves = async (req, res) => {
    try {
        const employee = await Employee.findOne({
            userId: req.user._id
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        const leaves = await Leave.find({
            employeeId: employee._id
        }).sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        console.error("Get leaves error:", error);

        res.status(500).json({
            message: "Failed to fetch leave history"
        });
    }
};

const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate({
                path: "employeeId",
                populate: {
                    path: "userId",
                    select: "employeeId email"
                }
            })
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (error) {
        console.error("Get all leaves error:", error);

        res.status(500).json({
            message: "Failed to fetch leave applications"
        });
    }
};

const updateLeaveStatus = async (req, res) => {
    try {
        const { status, hrComment } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid leave status"
            });
        }

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                message: "Leave application not found"
            });
        }

        leave.status = status;

        if (hrComment !== undefined) {
            leave.hrComment = hrComment;
        }

        await leave.save();

        // Create notification for employee
        const employee = await Employee.findById(leave.employeeId);

        if (employee) {
            await Notification.create({
                userId: employee.userId,
                title: `Leave ${status}`,
                message:
                    status === "Approved"
                        ? "Your leave request has been approved by HR."
                        : "Your leave request has been rejected by HR.",
                type: "Leave"
            });
        }

        res.json({
            message: `Leave ${status.toLowerCase()} successfully`,
            leave
        });
    } catch (error) {
        console.error("Update leave error:", error);

        res.status(500).json({
            message: "Failed to update leave status"
        });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
};