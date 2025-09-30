// server\controllers\candidateController.js
import Candidate from '../models/Candidate.js';
import PDFParser from 'pdf2json'; 

// This function wraps the callback-based pdf2json in a modern Promise
const parsePdfBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    // Set up event listeners for the parser
    pdfParser.on('pdfParser_dataError', errData => {
      console.error(errData.parserError);
      reject(new Error('Error parsing PDF file.'));
    });

    pdfParser.on('pdfParser_dataReady', pdfData => {
      // Extract the raw text content from the parsed data
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    // Load the PDF buffer to start parsing
    pdfParser.parseBuffer(buffer);
  });
};


// A simple utility to extract info from text.
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
 * @description Start the interview process by uploading a resume.
 * @route   POST /api/candidates/start
 * @access  Public
 */
export const startInterview = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Resume file is required.');
    }

    const dataBuffer = req.file.buffer;
    // <-- 2. USE our new promise-based parser
    const textContent = await parsePdfBuffer(dataBuffer);
    const extractedInfo = extractInfoFromText(textContent);
    
    const { role } = req.body;
    
    // Create a new candidate
    const candidate = await Candidate.create({
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
 * @description Get all candidates for the interviewer dashboard.
 * @route   GET /api/candidates
 * @access  Public
 */
export const getCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({}).sort({ finalScore: -1 });
    res.status(200).json(candidates);
  } catch (error) {
    next(error);
  }
};


/**
 * @description Update candidate details (for missing info)
 * @route   PATCH /api/candidates/:id
 * @access  Public
 */
export const updateCandidateDetails = async (req, res, next) => {
    const { name, email, phone } = req.body;
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (candidate) {
            candidate.name = name || candidate.name;
            candidate.email = email || candidate.email;
            candidate.phone = phone || candidate.phone;

            const updatedCandidate = await candidate.save();
            res.status(200).json({
                message: 'Candidate updated successfully.',
                candidate: updatedCandidate,
            });
        } else {
            res.status(404);
            throw new Error('Candidate not found');
        }
    } catch (error) {
        next(error)
    }
};

