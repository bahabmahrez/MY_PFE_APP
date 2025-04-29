const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// Get pending manufacturers
router.get('/pending-manufacturers', async (req, res) => {
  try {
    const pendingManufacturers = await User.find({ 
      role: 'manufacturer', 
      isApproved: false 
    }).select('-password');
    
    res.json(pendingManufacturers);
  } catch (error) {
    console.error('Error fetching pending manufacturers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a manufacturer
router.put('/approve-manufacturer/:id', async (req, res) => {
  try {
    const manufacturer = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    
    if (!manufacturer) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }
    
    res.json({ 
      manufacturer,
      message: 'Manufacturer approved successfully' 
    });
  } catch (error) {
    console.error('Error approving manufacturer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a manufacturer (optional)
router.put('/reject-manufacturer/:id', async (req, res) => {
  try {
    const manufacturer = await User.findById(req.params.id);
    
    if (!manufacturer) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Manufacturer rejected and removed' });
  } catch (error) {
    console.error('Error rejecting manufacturer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;