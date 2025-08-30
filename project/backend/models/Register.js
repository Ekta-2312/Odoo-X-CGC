const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RegisterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  mobile: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'mechanic', 'admin'], 
    default: 'user' 
  },
  vehicleDetails: {
    make: String,
    model: String,
    year: String,
    licensePlate: String,
    vehicleType: String
  },
  isVerified: { type: Boolean, default: false },
  provider: { type: String, enum: ['email', 'google'], default: 'email' },
  googleId: String,
  profileImage: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  rating: { type: Number, default: 0 },
  totalServices: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
RegisterSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
RegisterSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Register', RegisterSchema);
