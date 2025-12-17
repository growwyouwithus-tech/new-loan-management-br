import Notification from '../models/Notification.js';

export const createNotification = async (req, res) => {
  try {
    const notificationData = req.body;
    const notification = await Notification.create(notificationData);

    res.status(201).json({
      message: 'Notification created successfully',
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, read, targetRole } = req.query;
    const query = {};

    if (read !== undefined) {
      query.read = read === 'true';
    }

    if (targetRole) {
      query.targetRole = targetRole;
    } else if (req.user.role !== 'admin') {
      query.targetRole = req.user.role;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readBy.push({
      userId: req.user._id,
      readAt: new Date(),
    });

    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const query = req.user.role !== 'admin' 
      ? { targetRole: req.user.role, read: false }
      : { read: false };

    await Notification.updateMany(
      query,
      { 
        read: true,
        $push: {
          readBy: {
            userId: req.user._id,
            readAt: new Date(),
          }
        }
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    const query = req.user.role !== 'admin' 
      ? { targetRole: req.user.role }
      : {};

    await Notification.deleteMany(query);

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const query = req.user.role !== 'admin' 
      ? { targetRole: req.user.role, read: false }
      : { read: false };

    const count = await Notification.countDocuments(query);

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
