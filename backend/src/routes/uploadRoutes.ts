import express from 'express';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/image', upload.single('attachment'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the filename for saving in the DB
  res.status(200).json({ filename: req.file.filename });
});

export default router;
