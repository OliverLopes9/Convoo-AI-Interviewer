import express from 'express';
import { User } from '../models/User';
import { authMiddleware, signToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      education = '',
      experience = '',
      skills = '',
      pastProjects = '',
      targetRole = '',
    } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      education,
      experience,
      skills,
      pastProjects,
      targetRole,
    });

    const token = signToken(user._id.toString());
    const safe = user.toObject() as unknown as Record<string, unknown>;
    delete safe.password;

    res.status(201).json({
      user: safe,
      token,
      expiresIn: '7d',
    });
  } catch (err) {
    console.error('[auth] signup error:', err);
    res.status(500).json({
      error: 'Registration failed',
      message: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Internal server error',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const match = await user.comparePassword(password);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken(user._id.toString());
    const safe = user.toObject() as unknown as Record<string, unknown>;
    delete safe.password;

    res.json({
      user: safe,
      token,
      expiresIn: '7d',
    });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Internal server error',
    });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const safe = user.toObject();
    res.json({ user: safe });
  } catch (err) {
    console.error('[auth] me error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const { name, education, experience, skills, pastProjects, targetRole } = req.body;
    if (name !== undefined) user.name = name;
    if (education !== undefined) user.education = education;
    if (experience !== undefined) user.experience = experience;
    if (skills !== undefined) user.skills = skills;
    if (pastProjects !== undefined) user.pastProjects = pastProjects;
    if (targetRole !== undefined) user.targetRole = targetRole;
    await user.save();
    const safe = user.toObject() as unknown as Record<string, unknown>;
    delete safe.password;
    res.json({ user: safe });
  } catch (err) {
    console.error('[auth] patch me error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
