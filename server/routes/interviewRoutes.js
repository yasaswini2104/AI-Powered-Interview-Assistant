// server\routes\interviewRoutes.js
import express from 'express';
import { generateQuestion, submitAnswer, completeInterview } from '../controllers/interviewController.js';

const router = express.Router();

// These routes MUST remain public for trial mode to work
// Trial mode users don't have authentication tokens
router.post('/question', generateQuestion);
router.post('/answer', submitAnswer);
router.post('/complete', completeInterview);

export default router;