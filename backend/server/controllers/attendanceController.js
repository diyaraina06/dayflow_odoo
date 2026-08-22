const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const getEmployeeProfile = async (userId) => {
    return await Employee.findOne({ userId });
};

// CHECK IN
const checkIn = async (req, res) => {
    try {
        const employee = await getEmployeeProfile(req.user._id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({
                message: "Already checked in today"
            });
        }

        if (!attendance) {
            attendance = await Attendance.create({
                employeeId: employee._id,
                date: new Date(),
                checkIn: new Date(),
                status: "Present"
            });
        } else {
            attendance.checkIn = new Date();
            attendance.status = "Present";
            await attendance.save();
        }

        res.status(200).json({
            message: "Check-in successful",
            attendance
        });
    } catch (error) {
        console.error("Check-in error:", error);

        res.status(500).json({
            message: "Failed to check in"
        });
    }
};

// CHECK OUT
const checkOut = async (req, res) => {
    try {
        const employee = await getEmployeeProfile(req.user._id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({
                message: "Please check in first"
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                message: "Already checked out today"
            });
        }

        attendance.checkOut = new Date();

        await attendance.save();

        res.status(200).json({
            message: "Check-out successful",
            attendance
        });
    } catch (error) {
        console.error("Check-out error:", error);

        res.status(500).json({
            message: "Failed to check out"
        });
    }
};

// GET MY ATTENDANCE
const getMyAttendance = async (req, res) => {
    try {
        const employee = await getEmployeeProfile(req.user._id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        const attendance = await Attendance.find({
            employeeId: employee._id
        }).sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        console.error("Get attendance error:", error);

        res.status(500).json({
            message: "Failed to fetch attendance"
        });
    }
};

// GET ALL ATTENDANCE - HR ONLY
const getAllAttendance = async (req, res) => {
    try {
        const assignedEmployees = await Employee.find({ assignedHR: req.user._id });
        const employeeIds = assignedEmployees.map(emp => emp._id);

        const attendance = await Attendance.find({ employeeId: { $in: employeeIds } })
            .populate({
                path: "employeeId",
                populate: {
                    path: "userId",
                    select: "employeeId email"
                }
            })
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        console.error("Get all attendance error:", error);

        res.status(500).json({
            message: "Failed to fetch attendance records"
        });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getMyAttendance,
    getAllAttendance
};