// import express from 'express';

// import multer from 'multer';
// // import PdfParse from 'pdf-parse';
// import PdfParse from 'pdf-parse/lib/pdf-parse.js';
// import mammoth from 'mammoth';
// import fs from 'fs';
// import path from 'path';

// const router = express.Router();
// let filePath;

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
// });

// router.post('/pdf', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Check if it's actually a PDF
//     if (req.file.mimetype !== 'application/pdf') {
//       return res
//         .status(400)
//         .json({ error: 'Only PDF files are supported on this endpoint' });
//     }

//     filePath = req.file.buffer;
//     // filePath = req.file.path;

//     // Read fresh buffer each time
//     const pdfBuffer = Buffer.from(fs.readFileSync(filePath));

//     // Check PDF signature
//     if (!pdfBuffer.subarray(0, 4).toString() === '%PDF') {
//       return res.status(400).json({ error: 'Invalid PDF file' });
//     }

//     // Add some logging to debug
//     console.log(
//       'Processing PDF:',
//       req.file.originalname,
//       'Size:',
//       pdfBuffer.length
//     );

//     const data = await PdfParse(pdfBuffer);

//     res.json({ text: data.text });
//   } catch (error) {
//     console.error('PDF extraction error:', error);
//     res.status(500).json({ error: error.message });
//   } finally {
//     if (filePath) {
//       try {
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
//       } catch (cleanupError) {
//         console.warn('Failed to cleanup file:', cleanupError.message);
//       }
//     }
//   }
// });

// router.post('/document', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const result = await mammoth.extractRawText({ path: req.file.path });

//     filePath = req.file.path;

//     res.json({ text: result.value });
//   } catch (error) {
//     console.error('Document extraction error:', error);
//     // if (req.file) fs.unlinkSync(req.file.path);
//     res.status(500).json({ error: error.message });
//   } finally {
//     if (filePath) {
//       try {
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
//       } catch (cleanupError) {
//         console.warn('Failed to cleanup file:', cleanupError.message);
//       }
//     }
//   }
// });

// export default router;
import express from 'express';
import multer from 'multer';
import PdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post('/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if it's actually a PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res
        .status(400)
        .json({ error: 'Only PDF files are supported on this endpoint' });
    }

    // Use the buffer directly - no need for fs.readFileSync
    const pdfBuffer = req.file.buffer;

    // Check PDF signature
    if (!pdfBuffer.subarray(0, 4).toString() === '%PDF') {
      return res.status(400).json({ error: 'Invalid PDF file' });
    }

    console.log(
      'Processing PDF:',
      req.file.originalname,
      'Size:',
      pdfBuffer.length
    );

    const data = await PdfParse(pdfBuffer);

    res.json({ text: data.text });
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ error: error.message });
  }
  // No cleanup needed - memory is automatically freed
});

router.post('/document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Use buffer instead of path for mammoth
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });

    res.json({ text: result.value });
  } catch (error) {
    console.error('Document extraction error:', error);
    res.status(500).json({ error: error.message });
  }
  // No cleanup needed - memory is automatically freed
});

export default router;
