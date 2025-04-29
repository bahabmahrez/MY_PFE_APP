const mongoose = require('mongoose');

const ManufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  website: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    country: { type: String }
  },
  phone: { type: String }
}, { timestamps: true }); // Enable automatic timestamps

module.exports = mongoose.model('Manufacturer', ManufacturerSchema);
