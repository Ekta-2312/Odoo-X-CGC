const Register = require('../models/Register');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Create OAuth2 client with credentials
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/auth/google/callback`
);

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

exports.register = async (req, res) => {
  try {
    const { email, password, name, mobile, role = 'user', vehicleDetails = {} } = req.body;
    
    // Check if user already exists
    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with email and user data
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      verified: false,
      userData: { email, password, name, mobile, role, vehicleDetails }
    });

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'RoadGuard - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976D2;">Welcome to RoadGuard!</h2>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1976D2; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    res.status(201).json({ 
      message: 'Registration initiated. Please check your email for OTP.',
      email: email
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.googleAuth = (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true
  });

  res.redirect(authUrl);
};

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    console.log('Google callback - received user data:', data);

    // Check if user exists
    let user = await Register.findOne({ email: data.email });
    
    if (!user) {
      // New user - send OTP for verification and role selection
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log('Storing OTP for new Google user:', data.email, 'OTP:', otp);
      
      otpStore.set(data.email, {
        otp,
        timestamp: Date.now(),
        verified: false,
        isGoogleAuth: true,
        googleData: data,
        needsRoleSelection: true // Add this flag
      });

      // Send OTP email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: 'RoadGuard - Complete Your Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976D2;">Welcome to RoadGuard!</h2>
            <p>Complete your registration with this OTP:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1976D2; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>After verification, you'll select your role and complete your profile setup.</p>
          </div>
        `
      });

      console.log('Redirecting to verify page with email:', data.email);
      
      // Redirect to OTP verification page with the actual email
      res.redirect(`http://localhost:5173/verify?email=${encodeURIComponent(data.email)}&google=true`);
    } else {
      // Existing user - direct login
      const token = jwt.sign({ 
        userId: user._id,
        email: user.email,
        role: user.role 
      }, process.env.JWT_SECRET);
      
      console.log('Existing user login, redirecting to dashboard');
      res.redirect(`http://localhost:5173/dashboard?token=${token}&role=${user.role}`);
    }
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`http://localhost:5173/auth?error=${encodeURIComponent(error.message)}`);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log('=== OTP VERIFICATION DEBUG ===');
    console.log('Email received:', email);
    console.log('OTP received:', otp);
    
    const storedOtpData = otpStore.get(email);
    console.log('Stored OTP data:', storedOtpData);

    if (!storedOtpData) {
      console.log('❌ No OTP data found for email:', email);
      return res.status(400).json({ error: 'No OTP found for this email. Please request a new OTP.' });
    }

    // Check if OTP expired (10 minutes)
    const currentTime = Date.now();
    const otpAge = currentTime - storedOtpData.timestamp;
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    if (otpAge > maxAge) {
      console.log('❌ OTP expired');
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
    }

    // Convert both OTPs to strings and trim whitespace for comparison
    const receivedOtp = String(otp).trim();
    const storedOtp = String(storedOtpData.otp).trim();
    
    console.log('=== OTP COMPARISON ===');
    console.log('Received OTP (trimmed):', JSON.stringify(receivedOtp));
    console.log('Stored OTP (trimmed):', JSON.stringify(storedOtp));
    console.log('Are they equal?:', receivedOtp === storedOtp);

    // STRICT OTP comparison
    if (receivedOtp !== storedOtp) {
      console.log('❌ OTP MISMATCH!');
      return res.status(400).json({ 
        error: 'Invalid OTP. Please check the 6-digit code from your email.',
        expected: storedOtp, // Remove this in production
        received: receivedOtp // Remove this in production
      });
    }

    console.log('✅ OTP VERIFIED SUCCESSFULLY');

    // Handle Google Auth verification
    if (storedOtpData.isGoogleAuth && storedOtpData.needsRoleSelection) {
      console.log('Google auth OTP verified - need role selection');
      
      // Don't create user yet, just mark as verified and redirect to registration
      otpStore.set(email, {
        ...storedOtpData,
        verified: true
      });

      return res.json({ 
        message: 'Email verified successfully',
        needsRegistration: true,
        isGoogleAuth: true,
        email: email,
        googleData: storedOtpData.googleData
      });
    }

    // Regular verification - mark as verified but don't create user yet
    console.log('Regular email verification successful');
    otpStore.set(email, {
      ...storedOtpData,
      verified: true
    });

    res.json({ 
      message: 'Email verified successfully',
      needsRegistration: true,
      email: email
    });
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
};

exports.completeRegistration = async (req, res) => {
  try {
    const { email, name, mobile, role = 'user', vehicleDetails = {} } = req.body;
    const storedOtpData = otpStore.get(email);

    if (!storedOtpData || !storedOtpData.verified) {
      return res.status(400).json({ error: 'Email not verified' });
    }

    let userData = {
      email,
      name,
      mobile,
      role,
      vehicleDetails,
      isVerified: true,
      provider: 'email'
    };

    // If it's Google auth, add Google-specific data
    if (storedOtpData.isGoogleAuth && storedOtpData.googleData) {
      userData = {
        ...userData,
        name: name || storedOtpData.googleData.name,
        provider: 'google',
        googleId: storedOtpData.googleData.id
      };
    }

    // Create user with provided data
    const user = await Register.create(userData);

    // Clear OTP data
    otpStore.delete(email);

    const token = jwt.sign({ 
      userId: user._id,
      email: user.email,
      role: user.role 
    }, process.env.JWT_SECRET);

    res.json({ 
      message: 'Registration completed successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        vehicleDetails: user.vehicleDetails
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Register.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Email not verified' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      userId: user._id,
      email: user.email,
      role: user.role 
    }, process.env.JWT_SECRET);

    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        vehicleDetails: user.vehicleDetails
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const existingData = otpStore.get(email);
    
    if (!existingData) {
      return res.status(400).json({ error: 'No pending verification found' });
    }
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update OTP store
    otpStore.set(email, {
      ...existingData,
      otp,
      timestamp: Date.now()
    });

    // Send new OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'RoadGuard - New Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976D2;">New OTP for RoadGuard</h2>
          <p>Your new OTP for email verification is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1976D2; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
        </div>
      `
    });

    res.json({ message: 'New OTP sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};