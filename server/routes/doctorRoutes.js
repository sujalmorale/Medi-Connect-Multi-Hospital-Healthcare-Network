import express from 'express';
import { getDoctors, getDoctorById, updateSlots } from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id/slots', protect, authorize('doctor', 'hospAdmin', 'superAdmin'), updateSlots);

export default router;
