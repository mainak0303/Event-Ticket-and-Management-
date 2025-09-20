
const { User, UserJoiSchema } = require('../../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require("axios");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});


class UserAuthController {
  static async register(req, res) {
    const { error } = UserJoiSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    try {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) return res.status(409).json({ error: 'Email already registered.' });

      const hash = await bcrypt.hash(req.body.password, 10);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = new User({
        ...req.body,
        password: hash,
        verificationToken,
        emailVerified: false
      });

      await user.save();

      // Construct verification link (adjust frontend URL accordingly)
      const verifyUrl = `${process.env.FRONTEND_URL}/user/auth/verify?token=${verificationToken}`;

      // Send verification email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Please verify your email",
        html: `<p>Hello ${user.name},</p>
             <p>Please verify your email by clicking on the link below:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`
      });

      return res.status(201).json({
        status: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: user,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const token = (req.query.token || '').trim();
      console.log('Verification token received:', token);

      if (!token) {
        return res.status(400).send('Verification token is missing');
      }

      const user = await User.findOne({ verificationToken: token });
      console.log('User found for token:', user);

      if (!user) {
        return res.status(400).send('Invalid or expired verification token');
      }

      user.emailVerified = true;
      user.verificationToken = null;
      await user.save();

      return res.send('Email verified successfully. You can now log in.');
    } catch (err) {
      return res.status(500).send('Server error while verifying email');
    }
  }



  static async login(req, res) {
  const { email, password, captchaToken } = req.body;

  // ✅ Step 1: check captchaToken
  if (!captchaToken) {
    return res.status(400).json({ error: "Missing reCAPTCHA token" });
  }

  try {
    const verifyRes = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
    );

    if (!verifyRes.data.success) {
      return res.status(400).json({ error: "reCAPTCHA verification failed" });
    }
  } catch (err) {
    return res.status(400).json({ error: "Error verifying reCAPTCHA" });
  }

  // ✅ Step 2: proceed with login logic
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.emailVerified) {
      return res.status(401).json({ error: "Please verify your email before logging in." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    return res.status(200).json({
      status: true,
      message: "User login successfully",
      data: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires').lean();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found." });

      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/user/auth/reset-password?token=${resetToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Request",
        html: `<p>Hello ${user.name},</p>
            <p>You requested to reset your password. Click the link below:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>`
      });

      return res.json({ status: true, message: "Password reset link sent to your email." });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      if (!user) return res.status(400).json({ error: "Invalid or expired reset token." });

      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({ status: true, message: "Password reset successful. You may now log in." });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  static async updatePassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found." });

      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) return res.status(400).json({ error: "Old password is incorrect." });

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ status: true, message: "Password updated successfully." });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

}

module.exports = UserAuthController;
