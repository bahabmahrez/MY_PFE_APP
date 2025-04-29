const express = require('express');
const router = express.Router();
const Manufacturer = require('../models/Manufacturer');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Get all manufacturers (accessible to all authenticated users)
router.get('/', authenticate, async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find();
    res.json(manufacturers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a manufacturer (admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const newManufacturer = new Manufacturer(req.body);
    await newManufacturer.save();
    res.status(201).json(newManufacturer);
  } catch (error) {
    console.error('Error saving manufacturer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a manufacturer (admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const updatedManufacturer = await Manufacturer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedManufacturer);
  } catch (error) {
    console.error('Error updating manufacturer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a manufacturer (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const deletedManufacturer = await Manufacturer.findByIdAndDelete(req.params.id);

    if (!deletedManufacturer) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }

    res.json({ message: 'Manufacturer deleted' });
  } catch (error) {
    console.error('Error deleting manufacturer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;