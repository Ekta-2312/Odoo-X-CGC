const Vehicle = require('../models/Vehicle');

// List vehicles for current user
exports.listMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.userId }).sort({ isDefault: -1, updatedAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new vehicle for current user
exports.createVehicle = async (req, res) => {
  try {
    const data = req.body || {};
    const vehicle = await Vehicle.create({ ...data, owner: req.user.userId });

    // If first vehicle, mark as default
    const count = await Vehicle.countDocuments({ owner: req.user.userId });
    if (count === 1) {
      vehicle.isDefault = true;
      await vehicle.save();
    }

    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A vehicle with this plate already exists.' });
    }
    res.status(400).json({ error: err.message });
  }
};

// Update a vehicle (only owner)
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const vehicle = await Vehicle.findOne({ _id: id, owner: req.user.userId });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    Object.assign(vehicle, updates);
    await vehicle.save();

    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a vehicle (only owner)
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOneAndDelete({ _id: id, owner: req.user.userId });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Set a vehicle as default for the owner
exports.setDefaultVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOne({ _id: id, owner: req.user.userId });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    await Vehicle.updateMany({ owner: req.user.userId, _id: { $ne: id } }, { $set: { isDefault: false } });
    vehicle.isDefault = true;
    await vehicle.save();

    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
