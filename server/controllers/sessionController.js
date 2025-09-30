import InterviewSession from '../models/InterviewSession.js';

// @desc    Create a new interview session
// @route   POST /api/sessions/create
// @access  Private (Recruiters Only)
export const createSession = async (req, res, next) => {
  const { role } = req.body;

  if (!role) {
    res.status(400);
    throw new Error('Role is required to create a session.');
  }

  if (req.user.role !== 'recruiter') {
      res.status(403); 
      throw new Error('Only recruiters can create interview sessions.');
  }

  try {
    const session = await InterviewSession.create({
      createdBy: req.user._id,
      role,
    });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Get session details by ID (for a candidate using a link)
// @route   GET /api/sessions/:id
// @access  Public
export const getSessionById = async (req, res, next) => {
    try {
        const session = await InterviewSession.findById(req.params.id);
        if (session) {
            res.json({ role: session.role, createdBy: session.createdBy });
        } else {
            res.status(404);
            throw new Error('Interview session not found.');
        }
    } catch (error) {
        next(error);
    }
};
