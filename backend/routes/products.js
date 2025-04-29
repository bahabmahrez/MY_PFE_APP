const express = require('express');
const Product = require('../models/Product');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { authenticate, authorizeProductOwner, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure QR Code folder exists
const qrCodeDir = path.join(__dirname, '../public/qrcodes');
if (!fs.existsSync(qrCodeDir)) {
  fs.mkdirSync(qrCodeDir, { recursive: true });
}

// Check Database Connection Before Queries
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ message: "Database is not connected" });
  }
  next();
};

// Apply authentication to all product routes
router.use(authenticate);

// Create a New Product
router.post('/', checkDBConnection, async (req, res) => {
  const { name, description, categoryId, manufacturerId, origin, ingredients, certifications, price } = req.body;

  // For manufacturer users, force their ID
  const actualManufacturerId = req.user.role === 'manufacturer' ? req.user._id : manufacturerId;

  if (!name || !categoryId || !actualManufacturerId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const manufacturer = await User.findById(req.body.manufacturerId);
  
  if (!manufacturer?.isApproved) {
    return res.status(403).json({ 
      message: 'Manufacturer account not approved' 
    });
  }
  try {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(categoryId) || 
        !mongoose.Types.ObjectId.isValid(actualManufacturerId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const newProduct = new Product({ 
      name, 
      description, 
      categoryId, 
      manufacturerId: actualManufacturerId, 
      origin, 
      ingredients, 
      certifications,
      price: price || 0 
    });

    const savedProduct = await newProduct.save();

    // Generate QR Code
    const qrCodeText = `https://yourapp.com/product/${savedProduct._id}`;
    const qrImagePath = path.join(qrCodeDir, `${savedProduct._id}.png`);

    const qrPng = qr.image(qrCodeText, { type: 'png' });
    const writeStream = fs.createWriteStream(qrImagePath);

    qrPng.pipe(writeStream);

    writeStream.on('finish', async () => {
      savedProduct.qrCode = `/public/qrcodes/${savedProduct._id}.png`;
      await savedProduct.save();
      res.status(201).json(savedProduct);
    });

    writeStream.on('error', (err) => {
      console.error("QR Code generation error:", err);
      res.status(500).json({ message: "QR Code generation failed" });
    });

  } catch (error) {
    console.error("Product creation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Products (manufacturers only see their own)
router.get('/', checkDBConnection, async (req, res) => {
  try {
    const query = req.user.role === 'manufacturer' 
      ? { manufacturerId: req.user._id } 
      : {};
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a Single Product by ID
router.get('/:id', checkDBConnection, authorizeProductOwner, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a Product
router.put('/:id', checkDBConnection, authorizeProductOwner, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a Product
router.delete('/:id', checkDBConnection, authorizeProductOwner, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete QR Code Image
    const qrImagePath = path.join(qrCodeDir, `${product._id}.png`);
    if (fs.existsSync(qrImagePath)) {
      fs.unlinkSync(qrImagePath);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Products by Category
router.get('/by-category/:categoryId', checkDBConnection, async (req, res) => {
  try {
    const products = await Product.find({ categoryId: req.params.categoryId });
    res.json(products);
  } catch (error) {
    console.error("Get products by category error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Products by Manufacturer (admin only)
router.get('/by-manufacturer/:manufacturerId', checkDBConnection, authorizeAdmin, async (req, res) => {
  try {
    const products = await Product.find({ manufacturerId: req.params.manufacturerId });
    res.json(products);
  } catch (error) {
    console.error("Get products by manufacturer error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;