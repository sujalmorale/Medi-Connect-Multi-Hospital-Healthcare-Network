import express from 'express';
import { createOrder, verifySignature } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-signature', verifySignature);

export default router;
