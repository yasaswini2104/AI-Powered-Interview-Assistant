// client\src\routes\candidateRoutes.js
import express from 'express';
import { 
    getCandidates,
    getCandidateById,
    updateCandidateDetails, 
    startInterview,
    startPublicInterview,
    syncTrialToAccount
} from '../controllers/candidateController.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.route('/').get(protect, getCandidates);
router.route('/start').post(protect, uploadResume, startInterview);
router.route('/sync-trial').post(protect, syncTrialToAccount); // NEW: Sync trial data

// Get single candidate by ID - PROTECTED with authorization check
router.route('/:id').get(protect, getCandidateById);
router.route('/:id').patch(protect, updateCandidateDetails);

// Public route for candidates using recruiter's link
router.route('/start/public').post(uploadResume, startPublicInterview);

export default router;