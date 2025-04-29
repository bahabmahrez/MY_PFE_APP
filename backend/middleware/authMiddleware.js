const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach full user object
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const authorizeManufacturer = (req, res, next) => {
  if (req.user.role !== 'manufacturer') {
    return res.status(403).json({ message: 'Manufacturer access required' });
  }
  next();
};

const authorizeProductOwner = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.manufacturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only modify your own products' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeManufacturer,
  authorizeProductOwner
};