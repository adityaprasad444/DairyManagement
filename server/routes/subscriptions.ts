import express from 'express';
import { Subscription } from '../../src/models/Subscription';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Get all subscriptions
router.get('/', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ isActive: true });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subscription by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create subscription (admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const subscription = new Subscription(req.body);
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subscription (admin only)
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subscription (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    subscription.isActive = false;
    await subscription.save();
    res.json({ message: 'Subscription deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 