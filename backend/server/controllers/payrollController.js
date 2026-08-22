const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");

const calculateNetSalary = (basicSalary, allowances, deductions) => {
    return basicSalary + allowances - deductions;
};

// HR creates payroll
const createPayroll = async (req, res) => {
    try {
        const {
            employeeId,
            month,
            year,
            basicSalary,
            allowances = 0,
            deductions = 0
        } = req.body;

        if (
            !employeeId ||
            !month ||
            !year ||
            basicSalary === undefined
        ) {
            return res.status(400).json({
                message: "Required payroll fields are missing"
            });
        }

        const User = require("../models/User");
        const user = await User.findOne({ employeeId: employeeId });
        
        if (!user) {
            return res.status(404).json({
                message: "User not found with this Employee ID"
            });
        }

        const employee = await Employee.findOne({ userId: user._id });

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found for this user"
            });
        }

        // Verify that the employee is assigned to this HR
        if (!employee.assignedHR || employee.assignedHR.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to manage payroll for this employee. You must claim them first."
            });
        }

        const employeeObjId = employee._id;

        const existingPayroll = await Payroll.findOne({
            employeeId: employeeObjId,
            month,
            year
        });

        if (existingPayroll) {
            return res.status(400).json({
                message: "Payroll already exists for this month"
            });
        }

        const netSalary = calculateNetSalary(
            Number(basicSalary),
            Number(allowances),
            Number(deductions)
        );

        const payroll = await Payroll.create({
            employeeId: employeeObjId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            netSalary
        });

        await Notification.create({
            userId: employee.userId,
            title: "Payroll Generated",
            message: `Your payroll for ${month}/${year} has been generated successfully.`,
            type: "Payroll"
        });

        res.status(201).json({
            message: "Payroll generated successfully",
            payroll
        });
    } catch (error) {
        console.error("Create payroll error:", error);

        res.status(500).json({
            message: "Failed to generate payroll"
        });
    }
};

// Employee views own payroll
const getMyPayroll = async (req, res) => {
    try {
        const employee = await Employee.findOne({
            userId: req.user._id
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        const payroll = await Payroll.find({
            employeeId: employee._id
        }).sort({
            year: -1,
            month: -1
        });

        res.json(payroll);
    } catch (error) {
        console.error("Get payroll error:", error);

        res.status(500).json({
            message: "Failed to fetch payroll"
        });
    }
};

// HR views all payroll
const getAllPayroll = async (req, res) => {
    try {
        // Find employees assigned to the logged-in HR
        const assignedEmployees = await Employee.find({ assignedHR: req.user._id });
        const employeeIds = assignedEmployees.map(emp => emp._id);

        const payroll = await Payroll.find({ employeeId: { $in: employeeIds } })
            .populate({
                path: "employeeId",
                populate: {
                    path: "userId",
                    select: "employeeId email"
                }
            })
            .sort({
                year: -1,
                month: -1
            });

        res.json(payroll);
    } catch (error) {
        console.error("Get all payroll error:", error);

        res.status(500).json({
            message: "Failed to fetch payroll"
        });
    }
};

module.exports = {
    createPayroll,
    getMyPayroll,
    getAllPayroll
};