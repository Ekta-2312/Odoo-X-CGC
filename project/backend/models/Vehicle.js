const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true, index: true },
    vehicleType: { type: String, enum: ['car', 'bike', 'scooter', 'truck', 'van', 'bus', 'other'], required: true },
    make: { type: String },
    model: { type: String },
    year: { type: String },
    licensePlate: { type: String, required: true },
    color: { type: String },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg', 'other'], default: 'petrol' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique per owner + licensePlate
VehicleSchema.index({ owner: 1, licensePlate: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
