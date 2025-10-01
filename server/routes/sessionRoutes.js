// server\routes\sessionRoutes.js
import express from 'express';
import { createSession, getSessionById } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createSession);
router.get('/:id', getSessionById);

export default router;
