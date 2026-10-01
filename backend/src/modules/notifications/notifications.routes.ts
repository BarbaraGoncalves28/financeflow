import { Router } from 'express';

import {
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  markAllAsReadController,
  markAsReadController,
} from './notifications.controller.js';

import { authenticate } from '../../middlewares/authenticate.js';

const notificationsRoutes = Router();

notificationsRoutes.use(authenticate);

notificationsRoutes.get(
  '/',
  getNotificationsController,
);

notificationsRoutes.get(
  '/unread-count',
  getUnreadCountController,
);

notificationsRoutes.patch(
  '/read-all',
  markAllAsReadController,
);

notificationsRoutes.patch(
  '/:id/read',
  markAsReadController,
);

notificationsRoutes.delete(
  '/:id',
  deleteNotificationController,
);

export default notificationsRoutes;