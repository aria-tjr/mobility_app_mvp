const express = require('express');
const router = express.Router();

// Health check for vehicle service
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Vehicle Service' });
});

// Placeholder routes for MVP
router.get('/', (req, res) => {
  res.json({ message: 'Get all vehicles' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get vehicle ${req.params.id}` });
});

module.exports = router;
