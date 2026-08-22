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
            "firstName",
            "lastName",
            "phone",
            "address",
            "profilePicture",
            "department",
            "designation"
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

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate("userId", "employeeId email role")
            .populate("assignedHR", "employeeId email");

        // Fetch associated HR Profiles to get their first/last names and phone numbers
        const hrIds = employees.map(emp => emp.assignedHR?._id).filter(Boolean);
        const hrProfiles = await Employee.find({ userId: { $in: hrIds } });
        const hrProfileMap = {};
        hrProfiles.forEach(p => {
            hrProfileMap[p.userId.toString()] = p;
        });

        const result = employees.map(emp => {
            const empObj = emp.toObject();
            if (empObj.assignedHR) {
                const hrProf = hrProfileMap[empObj.assignedHR._id.toString()];
                empObj.assignedHRProfile = hrProf ? {
                    firstName: hrProf.firstName,
                    lastName: hrProf.lastName,
                    phone: hrProf.phone,
                    email: empObj.assignedHR.email
                } : {
                    firstName: "HR",
                    lastName: "Manager",
                    phone: "",
                    email: empObj.assignedHR.email
                };
            }
            return empObj;
        });

        res.json(result);
    } catch (error) {
        console.error("Get all employees error:", error);
        res.status(500).json({ message: "Failed to fetch employees" });
    }
};

const assignHR = async (req, res) => {
    try {
        const User = require("../models/User");
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Check if already assigned
        if (employee.assignedHR) {
            if (employee.assignedHR.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: "You are already managing this employee" });
            }
            
            // Fetch the assigned HR's details
            const currentHRUser = await User.findById(employee.assignedHR);
            const currentHRProfile = await Employee.findOne({ userId: employee.assignedHR });
            
            const hrName = currentHRProfile ? `${currentHRProfile.firstName} ${currentHRProfile.lastName}` : 'another HR';
            const hrEmail = currentHRUser ? currentHRUser.email : 'N/A';
            const hrPhone = currentHRProfile && currentHRProfile.phone ? currentHRProfile.phone : 'N/A';

            return res.status(400).json({
                message: `This user is taken by ${hrName}. Please contact her at ${hrEmail} or ${hrPhone}.`,
                assignedHR: {
                    name: hrName,
                    email: hrEmail,
                    phone: hrPhone
                }
            });
        }

        employee.assignedHR = req.user._id;
        await employee.save();

        res.json({
            message: "Employee assigned to your team successfully",
            employee
        });
    } catch (error) {
        console.error("Assign HR error:", error);
        res.status(500).json({ message: "Failed to assign HR" });
    }
};

const dropHR = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (!employee.assignedHR || employee.assignedHR.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: "You are not managing this employee" });
        }

        employee.assignedHR = null;
        await employee.save();

        res.json({
            message: "Employee dropped from your team successfully",
            employee
        });
    } catch (error) {
        console.error("Drop HR error:", error);
        res.status(500).json({ message: "Failed to drop employee" });
    }
};

const updateLeaveBalance = async (req, res) => {
    try {
        const { sick, casual, earned } = req.body;
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (sick !== undefined) employee.leaveBalance.sick = sick;
        if (casual !== undefined) employee.leaveBalance.casual = casual;
        if (earned !== undefined) employee.leaveBalance.earned = earned;

        await employee.save();

        res.json({
            message: "Leave balance updated successfully",
            leaveBalance: employee.leaveBalance
        });
    } catch (error) {
        console.error("Update leave balance error:", error);
        res.status(500).json({ message: "Failed to update leave balance" });
    }
};

module.exports = {
    createProfile,
    getMyProfile,
    updateMyProfile,
    getAllEmployees,
    updateLeaveBalance,
    assignHR,
    dropHR
};