import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';

const settingsRoutes = Router();
const settingsController = new SettingsController();

settingsRoutes.use(authenticate);
settingsRoutes.get('/', settingsController.getSettings);
settingsRoutes.put('/', settingsController.updateSettings);

export { settingsRoutes };