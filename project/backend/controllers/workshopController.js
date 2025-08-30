const Register = require('../models/Register');

exports.listMechanics = async (req, res) => {
  try {
  const { q, status, maxKm } = req.query;
  // Return mechanics by role only
  const filter = { role: 'mechanic' };
  if (status) filter.status = status;
    // Basic text filter
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { 'location.address': new RegExp(q, 'i') },
      ];
    }
    const docs = await Register.find(filter).limit(100);
    res.json(
      docs.map((m) => ({
        id: m._id,
        name: m.name,
        email: m.email,
        mobile: m.mobile || m.phone || m.contactNumber || '',
        profileImage: m.profileImage,
        rating: m.rating || 0,
        totalServices: m.totalServices || 0,
        location: m.location || {},
        isVerified: !!m.isVerified,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }))
    );
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getMechanic = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Register.findById(id);
    if (!doc || doc.role !== 'mechanic') return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
