// server\routes\interviewRoutes.js
import express from 'express';
import { generateQuestion, submitAnswer, completeInterview } from '../controllers/interviewController.js';

const router = express.Router();

router.post('/question', generateQuestion);
router.post('/answer', submitAnswer);
router.post('/complete', completeInterview); // New route to finalize the interview

export default router;

