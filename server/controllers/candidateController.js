import Candidate from '../models/Candidate.js';
import PDFParser from 'pdf2json';
import InterviewSession from '../models/InterviewSession.js';

/**
 * Parses a PDF buffer and returns its raw text content.
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} A promise that resolves with the text content.
 */
const parsePdfBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => {
      console.error(errData.parserError);
      reject(new Error('Error parsing PDF file. It might be corrupted or in an unsupported format.'));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    pdfParser.parseBuffer(buffer);
  });
};

/**
 * Extracts basic contact information from raw text using regular expressions.
 * @param {string} text - The text content of the resume.
 * @returns {{name: string|null, email: string|null, phone: string|null}} Extracted info.
 */
const extractInfoFromText = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const nameRegex = /([A-Z][a-z'.-]+(?:\s+[A-Z][a-z'.-]+)*)/;

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
 * Validates the text to check if it's likely a resume.
 * A document is considered a resume if it contains contact info and at least 3 common resume keywords.
 * @param {string} text - The text content of the uploaded file.
 * @returns {boolean} - True if the text is likely a resume, false otherwise.
 */
const isLikelyResume = (text) => {
    const textLower = text.toLowerCase();
    const resumeKeywords = [
        'experience', 'education', 'skills', 'summary', 'objective',
        'projects', 'work history', 'qualifications', 'achievements',
        'contact', 'profile', 'references'
    ];
    const hasContactInfo = 
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(textLower) ||
        /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(textLower);
    let keywordCount = 0;
    for (const keyword of resumeKeywords) {
        if (textLower.includes(keyword)) {
            keywordCount++;
        }
    }
    return hasContactInfo && keywordCount >= 3;
};

/**
 * @description Start interview for authenticated user
 * @route  POST /api/candidates/start
 * @access Private
 */
export const startInterview = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Resume file is required.');
    }

    const textContent = await parsePdfBuffer(req.file.buffer);

    if (!isLikelyResume(textContent)) {
        res.status(400);
        throw new Error('The uploaded file does not appear to be a valid resume. Please try another file.');
    }

    const extractedInfo = extractInfoFromText(textContent);
    const { role } = req.body;
    
    const candidate = await Candidate.create({
      user: req.user._id,
      name: extractedInfo.name,
      email: extractedInfo.email,
      phone: extractedInfo.phone,
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
 * @route  POST /api/candidates/start/public
 * @access Public
 */
export const startPublicInterview = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    
    if (!req.file || !sessionId) {
      res.status(400);
      throw new Error('Resume file and Session ID are required.');
    }
    
    const session = await InterviewSession.findById(sessionId);
    if (!session || session.status !== 'active') {
      res.status(404);
      throw new Error('This interview session is not active or does not exist.');
    }

    const textContent = await parsePdfBuffer(req.file.buffer);

    if (!isLikelyResume(textContent)) {
        res.status(400);
        throw new Error('The uploaded file does not appear to be a valid resume. Please try another file.');
    }
    
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
 * @route   GET /api/candidates
 * @access  Private
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
 * @route   GET /api/candidates/:id
 * @access  Private
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
 * @description Update candidate details (with authorization check)
 * @route   PATCH /api/candidates/:id
 * @access  Private
 */
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
