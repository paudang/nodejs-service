import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true }
}, { strict: false });

export const PaymentModel = mongoose.model('Payment', PaymentSchema);
