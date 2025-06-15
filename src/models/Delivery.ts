import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
});

const deliverySchema = new mongoose.Schema({
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  consumerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'delivered'],
    default: 'pending',
  },
  products: [productSchema],
  deliveryDate: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

deliverySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Delivery = mongoose.model('Delivery', deliverySchema); 