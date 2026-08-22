const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        assignedHR: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        profilePicture: {
            type: String,
            default: ""
        },

        department: {
            type: String,
            trim: true
        },

        designation: {
            type: String,
            trim: true
        },

        joiningDate: {
            type: Date
        },

        employmentType: {
            type: String,
            enum: ["Full-time", "Part-time", "Intern", "Contract"],
            default: "Full-time"
        },

        salaryStructure: {
            basicSalary: {
                type: Number,
                default: 0
            },

            allowances: {
                type: Number,
                default: 0
            },

            deductions: {
                type: Number,
                default: 0
            }
        },

        leaveBalance: {
            sick: {
                type: Number,
                default: 10
            },
            casual: {
                type: Number,
                default: 10
            },
            earned: {
                type: Number,
                default: 15
            }
        },

        documents: [
            {
                name: String,
                url: String
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);