// server\controllers\candidateController.js
import Candidate from '../models/Candidate.js';
import PDFParser from 'pdf2json'; 
import InterviewSession from '../models/InterviewSession.js';
import mongoose from 'mongoose';

const parsePdfBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', errData => {
      console.error(errData.parserError);
      reject(new Error('Error parsing PDF file.'));
    });

    pdfParser.on('pdfParser_dataReady', pdfData => {
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    pdfParser.parseBuffer(buffer);
  });
};

const extractInfoFromText = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const nameRegex = /(?:[A-Z][a-z]+)\s(?:[A-Z][a-z]+)/;

  const email = text.match(emailRegex);
  const phone = text.match(phoneRegex);
  const name = text.match(nameRegex);

  return {
    name: name ? name[0] : null,
    email: email ? email[0] : null,
    phone: phone ? phone[0] : null,
  };
};

/**
 * @description Start interview for authenticated user (individual or recruiter)
 * @route   POST /api/candidates/start
 * @access  Private
 */
export const startInterview = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Resume file is required.');
    }

    const textContent = await parsePdfBuffer(req.file.buffer);
    const extractedInfo = extractInfoFromText(textContent);
    const { role } = req.body;
    
    // For authenticated INDIVIDUAL users, skip profile collection
    // Always provide default values so interview starts immediately
    const candidate = await Candidate.create({
      user: req.user._id,
      name: extractedInfo.name || req.user.name || 'Candidate',
      email: extractedInfo.email || req.user.email,
      phone: extractedInfo.phone || '000-000-0000',
      role: role || 'Full Stack Developer',
      status: 'pending',
    });

    res.status(201).json({ message: 'Candidate created successfully', candidate });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Start interview from public session link
 * @route   POST /api/candidates/start/public
 * @access  Public
 */
export const startPublicInterview = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    
    if (!req.file) {
      res.status(400);
      throw new Error('Resume file is required.');
    }
    
    if (!sessionId) {
      res.status(400);
      throw new Error('Session ID is required.');
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session || session.status !== 'active') {
      res.status(404);
      throw new Error('This interview session is not active or does not exist.');
    }

    const textContent = await parsePdfBuffer(req.file.buffer);
    const extractedInfo = extractInfoFromText(textContent);
    
    const candidate = await Candidate.create({
      user: session.createdBy,
      name: extractedInfo.name,
      email: extractedInfo.email,
      phone: extractedInfo.phone,
      role: session.role,
      status: 'pending',
    });

    session.candidates.push(candidate._id);
    await session.save();

    res.status(201).json({ message: 'Candidate created successfully', candidate });
  } catch (error) {
    next(error);
  }
};

/**
 * @description Get all candidates for logged-in user
 * @route   GET /api/candidates
 * @access  Private
 */
export const getCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(candidates);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Get single candidate by ID (with authorization check)
 * @route   GET /api/candidates/:id
 * @access  Private
 */
export const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    if (candidate.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this candidate');
    }

    res.status(200).json(candidate);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Sync trial interview data to authenticated account
 * @route   POST /api/candidates/sync-trial
 * @access  Private
 */
export const syncTrialToAccount = async (req, res, next) => {
  try {
    const { name, email, phone, role, interviewHistory, currentQuestionIndex, status } = req.body;

    // Create a new candidate record with the trial data
    const candidate = await Candidate.create({
      user: req.user._id,
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || '000-000-0000',
      role,
      status: status || 'in-progress',
      interviewHistory: interviewHistory || [],
    });

    res.status(201).json({
      message: 'Trial interview synced to your account successfully',
      candidate,
    });
  } catch (error) {
    next(error);
  }
};
//  * @route   PATCH /api/candidates/:id
//  * @access  Private
//  */
export const updateCandidateDetails = async (req, res, next) => {
  const { name, email, phone } = req.body;
  
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      res.status(404);
      throw new Error('Candidate not found');
    }

    if (candidate.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this candidate');
    }

    candidate.name = name || candidate.name;
    candidate.email = email || candidate.email;
    candidate.phone = phone || candidate.phone;

    const updatedCandidate = await candidate.save();
    
    res.status(200).json({
      message: 'Candidate updated successfully.',
      candidate: updatedCandidate,
    });
  } catch (error) {
    next(error);
  }
};