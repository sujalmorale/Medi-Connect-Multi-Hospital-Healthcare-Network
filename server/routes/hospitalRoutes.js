import express from 'express';
import { getHospitals, getHospitalById, createHospital, updateBeds } from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getHospitals);
router.get('/:id', getHospitalById);
router.post('/', protect, authorize('superAdmin'), createHospital);
router.put('/:id/beds', protect, authorize('hospAdmin', 'superAdmin'), updateBeds);

export default router;
