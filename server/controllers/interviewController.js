// server\controllers\interviewController.js
import Candidate from '../models/Candidate.js';
import { generateQuestion as generateAIQuestion, evaluateAnswer, generateFinalSummary } from '../services/openaiService.js';

/**
 * @description Generate the next question for the interview.
 * @route   POST /api/interview/question
 * @access  Public (supports trial mode)
 */
export const generateQuestion = async (req, res, next) => {
  const { candidateId, difficulty, role, history } = req.body;
  try {
    // For trial mode, candidateId will be like "trial-123456789"
    // These don't exist in database, so we skip the DB lookup
    const isTrialMode = candidateId && candidateId.startsWith('trial-');
    
    let candidate = null;
    let candidateRole = role;
    let questionHistory = history || [];

    if (!isTrialMode) {
      // Authenticated mode: fetch candidate from database
      candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        res.status(404);
        throw new Error('Candidate not found');
      }
      candidateRole = candidate.role;
      questionHistory = candidate.interviewHistory.map(h => h.question);
    }

    // Generate question using AI (works for both trial and authenticated mode)
    const question = await generateAIQuestion(candidateRole, difficulty, questionHistory);

    // Only update database if not in trial mode
    if (!isTrialMode && candidate) {
      candidate.interviewHistory.push({ question });
      candidate.status = 'in-progress';
      await candidate.save();
    }

    res.status(200).json({ question });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Submit an answer for evaluation.
 * @route   POST /api/interview/answer
 * @access  Public (supports trial mode)
 */
export const submitAnswer = async (req, res, next) => {
  const { candidateId, question, answer } = req.body;
  try {
    const isTrialMode = candidateId && candidateId.startsWith('trial-');
    
    let candidate = null;

    if (!isTrialMode) {
      candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        res.status(404);
        throw new Error('Candidate not found');
      }
    }

    // Call AI service to get evaluation (works for both modes)
    const evaluation = await evaluateAnswer(question, answer);

    // Only update database if not in trial mode
    if (!isTrialMode && candidate) {
      const lastEntry = candidate.interviewHistory.at(-1);
      if (lastEntry && lastEntry.question === question) {
        lastEntry.answer = answer;
        lastEntry.score = evaluation.score;
        lastEntry.feedback = evaluation.feedback;
        lastEntry.skillTags = evaluation.skillTags;
      } else {
        throw new Error("Question mismatch. Could not save answer.");
      }
      await candidate.save();
    }

    res.status(200).json(evaluation);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Finalize the interview and generate a summary.
 * @route   POST /api/interview/complete
 * @access  Public (supports trial mode)
 */
export const completeInterview = async (req, res, next) => {
    const { candidateId } = req.body;
    try {
        const isTrialMode = candidateId && candidateId.startsWith('trial-');
        
        if (isTrialMode) {
            // For trial mode, we can't generate a real summary without history
            // Return a mock response - the frontend will handle the display
            res.status(200).json({ 
                message: 'Trial interview completed!',
                candidate: {
                    _id: candidateId,
                    status: 'completed',
                    summary: 'Trial mode completed. Sign up to get AI-powered insights!',
                    insights: { strengths: [], weaknesses: [] },
                    recommendation: { verdict: 'Trial Mode', justification: 'Complete assessment requires sign up' },
                    finalScore: 0
                }
            });
            return;
        }

        // Authenticated mode: Full completion with AI summary
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            res.status(404); 
            throw new Error('Candidate not found');
        }

        const finalEvaluation = await generateFinalSummary(candidate.interviewHistory, candidate.role);

        const totalScore = candidate.interviewHistory.reduce((acc, entry) => acc + (entry.score || 0), 0);
        const finalScore = candidate.interviewHistory.length > 0 ? totalScore / candidate.interviewHistory.length : 0;
        
        candidate.summary = finalEvaluation.summary;
        candidate.insights = finalEvaluation.insights;
        candidate.recommendation = finalEvaluation.recommendation;
        candidate.finalScore = parseFloat(finalScore.toFixed(2));
        candidate.status = 'completed';

        await candidate.save();
        res.status(200).json({ message: 'Interview completed successfully!', candidate });
    } catch (error) {
        next(error);
    }
};