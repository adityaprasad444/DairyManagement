import express from 'express';
import { Billing } from '../../src/models/Billing';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Get all bills (admin only)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate('consumerId', 'name email phone')
      .populate('subscriptionId', 'name price');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consumer's bills
router.get('/consumer', auth, async (req: any, res) => {
  try {
    const bills = await Billing.find({ consumerId: req.user.userId })
      .populate('subscriptionId', 'name price');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bill by ID
router.get('/:id', auth, async (req: any, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('consumerId', 'name email phone')
      .populate('subscriptionId', 'name price');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check if user has permission to view this bill
    if (
      req.user.role !== 'admin' &&
      bill.consumerId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create bill (admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const bill = new Billing(req.body);
    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bill status
router.patch('/:id/status', auth, async (req: any, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Only admin or the consumer can update the status
    if (
      req.user.role !== 'admin' &&
      bill.consumerId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bill.status = req.body.status;
    if (req.body.status === 'paid') {
      bill.paidDate = new Date();
      bill.paymentMethod = req.body.paymentMethod;
      bill.transactionId = req.body.transactionId;
    }

    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bill details (admin only)
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 