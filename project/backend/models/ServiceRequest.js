const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['submitted', 'assigned', 'accepted', 'in-progress', 'completed', 'rejected', 'cancelled'],
      required: true,
    },
    note: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CommentSchema = new mongoose.Schema(
  {
    text: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
    role: { type: String, enum: ['user', 'mechanic', 'admin'] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ServiceRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
    mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' },
  serviceType: { type: String, required: true },
  // New: support multiple services selection
  serviceTypes: [{ type: String }],
    vehicleInfo: {
      make: String,
      model: String,
      year: String,
      plate: String,
      color: String,
      fuelType: String,
    },
    description: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    status: {
      type: String,
      enum: ['submitted', 'assigned', 'accepted', 'in-progress', 'completed', 'rejected', 'cancelled'],
      default: 'submitted',
      index: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    estimatedCost: String,
    estimatedTime: String,
    etaMinutes: { type: Number, default: 0 },
    history: [HistorySchema],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
