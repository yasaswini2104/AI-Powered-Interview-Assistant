// server\controllers\interviewController.js
import Candidate from '../models/Candidate.js';
import { generateQuestion as generateAIQuestion, evaluateAnswer, generateFinalSummary } from '../services/openaiService.js';


/**
 * @description Generate the next question for the interview.
 * @route   POST /api/interview/question
 * @access  Public
 */
export const generateQuestion = async (req, res, next) => {
  const { candidateId, difficulty } = req.body;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    // Get history of previous questions to avoid duplicates
    const questionHistory = candidate.interviewHistory.map(h => h.question);
    const question = await generateAIQuestion(candidate.role, difficulty, questionHistory);

    // Add the new question to history (without an answer yet)
    candidate.interviewHistory.push({ question });
    candidate.status = 'in-progress'; // Update status
    await candidate.save();

    res.status(200).json({ question });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Submit an answer for evaluation.
 * @route   POST /api/interview/answer
 * @access  Public
 */
export const submitAnswer = async (req, res, next) => {
  const { candidateId, question, answer } = req.body;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    // Call AI service to get a structured evaluation
    const evaluation = await evaluateAnswer(question, answer);

    // Find the latest question in history and update it with the answer and evaluation
    const lastEntry = candidate.interviewHistory.at(-1); // .at(-1) is a modern way to get the last item
    if (lastEntry && lastEntry.question === question) {
      lastEntry.answer = answer;
      lastEntry.score = evaluation.score;
      lastEntry.feedback = evaluation.feedback;
      lastEntry.skillTags = evaluation.skillTags;
    } else {
        throw new Error("Question mismatch. Could not save answer.");
    }
    
    await candidate.save();

    // Respond to the frontend with the AI's feedback
    res.status(200).json(evaluation);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Finalize the interview and generate a summary.
 * @route   POST /api/interview/complete
 * @access  Public
 */
export const completeInterview = async (req, res, next) => {
    const { candidateId } = req.body;
    try {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            res.status(404); throw new Error('Candidate not found');
        }

        // --- THIS IS THE FIX ---
        // Pass the candidate's role to the summary generation function.
        const finalEvaluation = await generateFinalSummary(candidate.interviewHistory, candidate.role);

        const totalScore = candidate.interviewHistory.reduce((acc, entry) => acc + (entry.score || 0), 0);
        const finalScore = candidate.interviewHistory.length > 0 ? totalScore / candidate.interviewHistory.length : 0;
        
        // Save all the new data from the AI.
        candidate.summary = finalEvaluation.summary;
        candidate.insights = finalEvaluation.insights;
        candidate.recommendation = finalEvaluation.recommendation; // Save the new recommendation object
        candidate.finalScore = parseFloat(finalScore.toFixed(2));
        candidate.status = 'completed';

        await candidate.save();
        res.status(200).json({ message: 'Interview completed successfully!', candidate });
    } catch (error) {
        next(error);
    }
};