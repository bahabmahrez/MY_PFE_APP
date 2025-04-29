const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  pic: {
    type: String,
    default: './assets/media/avatars/blank.png',
  },
  role: {
    type: String,
    enum: ['admin', 'manufacturer'],
    default: 'manufacturer', // Default role is manufacturer
  },
  isApproved: {
    type: Boolean,
    default: false // New manufacturers need admin approval
  },
  companyName: {
    type: String,
    default: null,
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);