const express = require('express');
const router = express.Router();

// Health check for user service
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'User Service' });
});

// Placeholder routes for MVP
router.get('/', (req, res) => {
  res.json({ message: 'Get all users' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get user ${req.params.id}` });
});

module.exports = router;
