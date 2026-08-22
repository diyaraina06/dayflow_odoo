const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user._id
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            message: "Failed to fetch notifications"
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            {
                isRead: true
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Mark notification error:", error);

        res.status(500).json({
            message: "Failed to update notification"
        });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead
};