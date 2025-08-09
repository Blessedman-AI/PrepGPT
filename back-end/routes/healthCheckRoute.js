import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend api working!',
    status: 'ok',
    uptime: process.uptime(),
  });
});

export default router;
