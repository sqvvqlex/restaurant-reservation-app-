const express = require('express');
const router = express.Router();

// Assistance route
router.post('/', async (req, res) => {
  try {
    const { type } = req.body;
    
    // Validate request type
    if (!type || !['waiter', 'refill'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assistance type. Must be either "waiter" or "refill".'
      });
    }

    // Log the request for debugging
    console.log('Received assistance request:', {
      type,
      timestamp: new Date().toISOString()
    });

    // Here you would typically save the assistance request to a database
    // For now, we'll just return a success response
    res.status(200).json({
      success: true,
      message: `${type === 'waiter' ? 'Waiter assistance' : 'Drink refill'} request received`
    });
  } catch (error) {
    console.error('Error processing assistance request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process assistance request'
    });
  }
});

module.exports = router; 