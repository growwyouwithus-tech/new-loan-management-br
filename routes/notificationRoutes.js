import express from 'express';
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin'), createNotification);
router.get('/', authenticate, getAllNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/:id', authenticate, getNotificationById);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);
router.delete('/', authenticate, clearAllNotifications);

export default router;
