import express from 'express';
import { User } from '../../src/models/User';
import { auth, checkRole } from '../middleware/auth';
import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const router = express.Router();

// Get all consumers (admin only) with pagination and search
router.get('/', auth, checkRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } },
          ],
          role: 'consumer',
        }
      : { role: 'consumer' };

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);

    // Get paginated results
    const consumers = await User.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      consumers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching consumers:', error);
    res.status(500).json({ message: 'Error fetching consumers' });
  }
});

// Create new consumer (admin only)
router.post('/', auth, checkRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Received request body:', req.body);
    const { name, email, phone, address } = req.body;
    
    if (!name || !email || !phone) {
      console.error('Missing required fields:', { name, email, phone });
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { name, email, phone }
      });
    }

    const consumer = new User({
      name,
      email,
      phone,
      role: 'consumer',
      password: 'default123', // You might want to generate a random password or require one
      address: address || 'Default Address' // Add default address if not provided
    });

    console.log('Creating consumer:', consumer);
    const savedConsumer = await consumer.save();
    console.log('Consumer saved successfully:', savedConsumer);
    
    res.status(201).json(savedConsumer);
  } catch (error) {
    console.error('Error creating consumer:', error);
    res.status(500).json({ 
      message: 'Error creating consumer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update consumer (admin only)
router.put('/:id', auth, checkRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;
    const consumer = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true }
    );
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }
    res.json(consumer);
  } catch (error) {
    console.error('Error updating consumer:', error);
    res.status(500).json({ message: 'Error updating consumer' });
  }
});

// Delete consumer (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const consumer = await User.findByIdAndDelete(req.params.id);
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }
    res.json({ message: 'Consumer deleted successfully' });
  } catch (error) {
    console.error('Error deleting consumer:', error);
    res.status(500).json({ message: 'Error deleting consumer' });
  }
});

export default router; 