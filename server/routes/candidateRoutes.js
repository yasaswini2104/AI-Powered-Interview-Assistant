// server\routes\candidateRoutes.js
import express from 'express';
// FIX 1: Import all three required functions, including startInterview
import { getCandidates, updateCandidateDetails, startInterview } from '../controllers/candidateController.js';
// FIX 2: Import the upload middleware
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// FIX 3: Connect the GET /api/candidates route
router.route('/').get(getCandidates);

// FIX 4: Connect the POST /api/candidates/start route for resume uploads
router.route('/start').post(uploadResume, startInterview);

// FIX 5: Connect the PATCH /api/candidates/:id route for updates
router.route('/:id').patch(updateCandidateDetails); 

export default router;

