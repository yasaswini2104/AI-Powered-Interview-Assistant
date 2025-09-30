import Candidate from '../models/Candidate.js';
import { generateQuestion as generateAIQuestion, evaluateAnswer, generateFinalSummary } from '../services/openaiService.js';

/**
 * @description Generate the next question for the interview.
 * @route   POST /api/interview/question
 * @access  Public (used during live interview by candidate)
 */
export const generateQuestion = async (req, res, next) => {
  const { candidateId, difficulty } = req.body;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    const questionHistory = candidate.interviewHistory.map(h => h.question);
    const question = await generateAIQuestion(candidate.role, difficulty, questionHistory);

    candidate.interviewHistory.push({ question });
    candidate.status = 'in-progress';
    await candidate.save();

    res.status(200).json({ question });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Submit an answer for evaluation.
 * @route   POST /api/interview/answer
 * @access  Public (used during live interview by candidate)
 */
export const submitAnswer = async (req, res, next) => {
  const { candidateId, question, answer } = req.body;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    const evaluation = await evaluateAnswer(question, answer);

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
    res.status(200).json(evaluation);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Finalize the interview and generate a summary.
 * @route   POST /api/interview/complete
 * @access  Public (used during live interview by candidate)
 */
export const completeInterview = async (req, res, next) => {
  const { candidateId } = req.body;
  try {
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
}