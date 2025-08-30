const ServiceRequest = require('../models/ServiceRequest');
const Register = require('../models/Register');

// Socket instance setter (injected from server)
let io = null;
exports.setSocket = (socketIo) => {
  io = socketIo;
};

// Simple notification stub (SMS/WhatsApp integration point)
const notify = async ({ toUserId, toMechanicId, type, data }) => {
  try {
    // TODO: integrate SMS/WhatsApp provider (e.g., Twilio) here
    console.log('[Notify]', { toUserId, toMechanicId, type, data });
  } catch {}
};

exports.createRequest = async (req, res) => {
  try {
    const {
      serviceType,
      serviceTypes,
      vehicleInfo,
      description,
      location,
      estimatedCost,
      estimatedTime,
      priority = 'medium',
  mechanicId,
    } = req.body;

    const primaryType = serviceType || (Array.isArray(serviceTypes) && serviceTypes.length ? serviceTypes[0] : undefined);
    if (!primaryType) throw new Error('serviceType or serviceTypes is required');

    let doc = await ServiceRequest.create({
      userId: req.user.userId,
      serviceType: primaryType,
      serviceTypes: Array.isArray(serviceTypes) ? serviceTypes : undefined,
      vehicleInfo,
      description,
      location,
      estimatedCost,
      estimatedTime,
      priority,
      history: [{ status: 'submitted', by: req.user.userId }],
    });

    // Assign selected mechanic if provided; else simple auto-assignment fallback
  if (mechanicId) {
      const mech = await Register.findById(mechanicId);
      if (mech && mech.role === 'mechanic') {
        doc = await ServiceRequest.findByIdAndUpdate(
          doc._id,
          {
            mechanicId: mech._id,
            status: 'assigned',
            etaMinutes: 20,
            $push: { history: { status: 'assigned', by: req.user.userId } },
          },
          { new: true }
        );
      }
  }

  io?.emit('request:new', doc);
  notify({ toUserId: doc.userId, type: 'request_created', data: { id: doc._id } });
    return res.status(201).json(doc);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.listMyRequests = async (req, res) => {
  try {
    const docs = await ServiceRequest.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    return res.json(docs);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.listPending = async (req, res) => {
  try {
  // Treat freshly submitted, admin-assigned, and mechanic-accepted as pending
  const docs = await ServiceRequest.find({ status: { $in: ['submitted', 'assigned', 'accepted'] } })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(docs);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const docs = await ServiceRequest.find({})
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json(docs);
  } catch (e) {
    console.error('listAll error:', e);
    // Be resilient: return empty list instead of failing the UI
    return res.json([]);
  }
};

exports.assignMechanic = async (req, res) => {
  try {
    const { id } = req.params;
    const { mechanicId, etaMinutes = 20 } = req.body;

    const mechanic = await Register.findById(mechanicId);
    if (!mechanic || mechanic.role !== 'mechanic') {
      return res.status(400).json({ error: 'Invalid mechanic' });
    }

    const doc = await ServiceRequest.findByIdAndUpdate(
      id,
      {
        mechanicId,
        status: 'assigned',
        etaMinutes,
        $push: { history: { status: 'assigned', by: req.user.userId } },
      },
      { new: true }
    );

    if (!doc) return res.status(404).json({ error: 'Not found' });
  io?.emit('request:updated', doc);
  notify({ toUserId: doc.userId, toMechanicId: mechanicId, type: 'assigned', data: { id } });
    return res.json(doc);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const allowed = ['accepted', 'in-progress', 'completed', 'rejected', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const doc = await ServiceRequest.findByIdAndUpdate(
      id,
      {
        status,
        $push: { history: { status, by: req.user.userId, note } },
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Not found' });
  io?.emit('request:updated', doc);
  notify({ toUserId: doc.userId, toMechanicId: doc.mechanicId, type: `status_${status}`, data: { id } });
    return res.json(doc);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const role = req.user.role;

    const doc = await ServiceRequest.findByIdAndUpdate(
      id,
      {
        $push: { comments: { text, by: req.user.userId, role } },
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Not found' });
    io?.emit('request:comment', { id, comment: doc.comments[doc.comments.length - 1] });
    return res.json(doc);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.listAssignedToMechanic = async (req, res) => {
  try {
    const docs = await ServiceRequest.find({ mechanicId: req.user.userId })
      .sort({ updatedAt: -1 })
      .populate('userId', 'name location');
    return res.json(docs);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ServiceRequest.findById(id)
      .populate('mechanicId', 'name location')
      .populate('userId', 'name location');
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const ownerId = doc.userId && (doc.userId._id ? String(doc.userId._id) : String(doc.userId));
    const mechanicId = doc.mechanicId && (doc.mechanicId._id ? String(doc.mechanicId._id) : String(doc.mechanicId));
    const isOwner = ownerId === req.user.userId;
    const isAssigned = mechanicId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  return res.json(doc);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
