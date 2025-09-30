import express from 'express';
import { generateQuestion, submitAnswer, completeInterview } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/question', generateQuestion);
router.post('/answer', submitAnswer);
router.post('/complete', completeInterview);

export default router;