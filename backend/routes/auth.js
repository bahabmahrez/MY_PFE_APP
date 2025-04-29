const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate} = require('../middleware/authMiddleware');


// Signup
router.post('/signup', async (req, res) => {
  const { username, firstname, lastname, email, password, role, companyName } = req.body;

  try {
    // Check if user already exists
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    if (!['admin', 'manufacturer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create new user
    const user = new User({
      username,
      firstname,
      lastname,
      email,
      password,
      role,
      companyName: role === 'manufacturer' ? companyName : null,
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const payload = { 
      userId: user.id, 
      role: user.role,
      companyName: user.companyName
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        username, 
        firstname, 
        lastname, 
        email, 
        role,
        companyName: user.companyName
      } 
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = { 
      userId: user.id, 
      role: user.role,
      companyName: user.companyName
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        firstname: user.firstname, 
        lastname: user.lastname, 
        email: user.email, 
        role: user.role,
        companyName: user.companyName
      } 
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).send('Server error');
  }
});
// Get user by token (Protected Route)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).send('Server error');
  }
});
module.exports = router;