// server\middleware\uploadMiddleware.js
import multer from 'multer';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

/**
 * @description Middleware to handle resume file uploads.
 * It expects a single file with the field name 'resume'.
 * It will attach the file buffer to `req.file`.
 */
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // We can add validation for file types here (e.g., PDF, DOCX)
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB file size limit
  },
});

export const uploadResume = upload.single('resume');
