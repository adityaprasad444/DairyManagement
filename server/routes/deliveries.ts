import express from 'express';
import { Delivery } from '../../src/models/Delivery';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Get all deliveries (admin and delivery person)
router.get('/', auth, checkRole(['admin', 'delivery']), async (req: any, res) => {
  try {
    let query = {};
    // If delivery person, only show their deliveries
    if (req.user.role === 'delivery') {
      query = { deliveryPersonId: req.user.userId };
    }
    const deliveries = await Delivery.find(query)
      .populate('deliveryPersonId', 'name phone')
      .populate('consumerId', 'name phone address');
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get delivery by ID
router.get('/:id', auth, async (req: any, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('deliveryPersonId', 'name phone')
      .populate('consumerId', 'name phone address');
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if user has permission to view this delivery
    if (
      req.user.role !== 'admin' &&
      req.user.userId !== delivery.deliveryPersonId.toString() &&
      req.user.userId !== delivery.consumerId.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create delivery (admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update delivery status (admin and delivery person)
router.patch('/:id/status', auth, checkRole(['admin', 'delivery']), async (req: any, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if delivery person is assigned to this delivery
    if (
      req.user.role === 'delivery' &&
      delivery.deliveryPersonId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    delivery.status = req.body.status;
    await delivery.save();
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update delivery details (admin only)
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 