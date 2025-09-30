import express from 'express';
import { 
    getCandidates,
    getCandidateById, 
    updateCandidateDetails, 
    startInterview,
    startPublicInterview 
} from '../controllers/candidateController.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getCandidates);
router.route('/start').post(protect, uploadResume, startInterview);
router.route('/:id').get(protect, getCandidateById);
router.route('/:id').patch(protect, updateCandidateDetails);

// Public route for candidates using recruiter's link
router.route('/start/public').post(uploadResume, startPublicInterview);

export default router;