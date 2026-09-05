import express from 'express';
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createAppointment);
router.get('/', getAppointments);
router.put('/:id/status', protect, authorize('doctor', 'hospAdmin', 'superAdmin'), updateAppointmentStatus);
router.delete('/:id', cancelAppointment);

export default router;
