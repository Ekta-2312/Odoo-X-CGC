require('dotenv').config();
const connectDB = require('../config/db');
const Register = require('../models/Register');

(async () => {
  try {
    await connectDB();
    const ensureUser = async (payload) => {
      let user = await Register.findOne({ email: payload.email });
      if (!user) {
        user = await Register.create(payload);
        console.log('Created:', payload.email);
      } else {
        console.log('Exists:', payload.email);
      }
    };

    await ensureUser({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      provider: 'email',
    });

    await ensureUser({
      name: 'Rajesh Kumar',
      email: 'mechanic@example.com',
      password: 'mechanic123',
      role: 'mechanic',
      isVerified: true,
      provider: 'email',
      location: { latitude: 28.5706, longitude: 77.3272, address: 'Sector 15, Noida' },
      totalServices: 120,
      rating: 4.7,
    });

    console.log('Seeding done.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
