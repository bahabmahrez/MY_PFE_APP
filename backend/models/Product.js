const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  qrCode: { type: String, required: false }, // Now it's optional
  origin: { type: String },
  ingredients: [{ type: String }],
  certifications: [{ type: String }],
  price: { type: Number, default: 0 }, // Added price field with default value
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);