import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axios';
import { type RootState } from '@/app/store';
import { isAxiosError } from 'axios';

// Mock AI responses for trial mode
const generateMockQuestion = (difficulty: string, role: string): string => {
  const questions = {
    Easy: [
      `Tell me about your experience with ${role} technologies.`,
      "What interests you most about this role?",
      "Describe a recent project you're proud of.",
    ],
    Medium: [
      `How would you approach debugging a complex issue in a ${role} project?`,
      "Explain your understanding of RESTful APIs.",
      "What's your preferred development workflow and why?",
    ],
    Hard: [
      `Design a scalable architecture for a high-traffic ${role} application.`,
      "How would you optimize performance in a production environment?",
      "Explain a time you solved a critical technical challenge.",
    ],
  };
  const pool = questions[difficulty as keyof typeof questions] || questions.Easy;
  return pool[Math.floor(Math.random() * pool.length)];
};

const generateMockEvaluation = (answer: string) => {
  const baseScore = Math.min(10, Math.max(5, 7 + Math.random() * 2));
  const lengthBonus = answer.length > 100 ? 0.5 : 0;
  const score = Math.min(10, baseScore + lengthBonus);
  
  return {
    score: Math.round(score * 10) / 10,
    feedback: "Good answer. In a real interview, you'd receive detailed AI feedback here.",
    skillTags: ["communication", "technical knowledge"],
  };
};

const generateMockSummary = () => ({
  summary: "Trial mode: This candidate demonstrated good communication skills during the practice interview.",
  insights: {
    strengths: ["Clear communication", "Technical understanding"],
    weaknesses: ["Could provide more specific examples"],
  },
  recommendation: {
    verdict: "Hire",
    justification: "Strong candidate for the role. Sign up for full AI-powered evaluations!",
  },
});

export const fetchQuestion = createAsyncThunk(
  'interview/fetchQuestion',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { candidateId, role } = state.interview;
    const { userInfo } = state.auth;
    
    const questionIndex = state.interview.currentQuestionIndex;
    let difficulty = 'Easy';
    if (questionIndex >= 4) {
      difficulty = 'Hard';
    } else if (questionIndex >= 2) {
      difficulty = 'Medium';
    }

    // TRIAL MODE: Generate mock question locally
    const isTrialMode = !userInfo && candidateId?.startsWith('trial-');
    if (isTrialMode) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      return { question: generateMockQuestion(difficulty, role) };
    }

    // AUTHENTICATED MODE: Call API
    const history = state.interview.history.map(h => h.question);
    try {
      const response = await apiClient.post('/interview/question', { 
        candidateId, 
        role, 
        difficulty, 
        history 
      });
      return response.data;
    } catch (err) { 
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('An unknown error occurred while fetching the question.');
    }
  }
);

// Thunk to submit an answer
export const submitAnswer = createAsyncThunk(
  'interview/submitAnswer',
  async (answer: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { candidateId, history } = state.interview;
    const { userInfo } = state.auth;
    const currentQuestion = history[history.length - 1]?.question;

    if (!currentQuestion) {
      return rejectWithValue('No active question to answer.');
    }

    // TRIAL MODE: Generate mock evaluation locally
    const isTrialMode = !userInfo && candidateId?.startsWith('trial-');
    if (isTrialMode) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return generateMockEvaluation(answer);
    }

    // AUTHENTICATED MODE: Call API
    try {
      const response = await apiClient.post('/interview/answer', {
        candidateId,
        question: currentQuestion,
        answer,
      });
      return response.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('An unknown error occurred while submitting the answer.');
    }
  }
);

// Thunk to finalize the interview
export const completeInterview = createAsyncThunk(
  'interview/complete',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { candidateId, history, name, email, role } = state.interview;
    const { userInfo } = state.auth;

    // TRIAL MODE: Generate mock summary locally
    const isTrialMode = !userInfo && candidateId?.startsWith('trial-');
    if (isTrialMode) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const totalScore = history.reduce((acc, entry) => acc + (entry.score || 7), 0);
      const finalScore = history.length > 0 ? totalScore / history.length : 7;
      const mockSummary = generateMockSummary();
      
      return {
        _id: candidateId!,
        name: name || 'Trial User',
        email: email || 'N/A',
        role,
        finalScore: parseFloat(finalScore.toFixed(2)),
        summary: mockSummary.summary,
        insights: mockSummary.insights,
        recommendation: mockSummary.recommendation,
        status: 'completed' as const,
        interviewHistory: history,
        createdAt: new Date().toISOString(),
      };
    }

    // AUTHENTICATED MODE: Call API
    try {
      const response = await apiClient.post('/interview/complete', { candidateId });
      return response.data.candidate;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('An unknown error occurred while completing the interview.');
    }
  }
);