import { Request, Response } from 'express';
import mongoose from 'mongoose';

// LỖI KIẾN TRÚC SỐ 1: Hardcode kết nối DB trực tiếp trong Controller (Leaky Abstraction & Tight Coupling)
mongoose.connect('mongodb://localhost:27017/my_database');

const PaymentSchema = new mongoose.Schema({}, { strict: false });
const PaymentModel = mongoose.model('Payment', PaymentSchema);

export class PaymentController {
  // LỖI KIẾN TRÚC SỐ 2: Lộ lọt mã bí mật (Hardcoded Secrets)
  private readonly STRIPE_SECRET_KEY = 'sk_live_1234567890abcdef';

  async processPayment(req: Request, res: Response) {
    try {
      // LỖI KIẾN TRÚC SỐ 3: Lỗ hổng Mass Assignment (Bê nguyên req.body ném vào DB mà không filter)
      // Hacker có thể gửi { "amount": 100, "isRefunded": true, "role": "admin" }
      const newPayment = await PaymentModel.create(req.body);

      // LỖI KIẾN TRÚC SỐ 4: Trả thẳng Entity gốc của DB cho Client (Leaking Database Schema)
      return res.status(201).json(newPayment);
    } catch (error) {
      // LỖI KIẾN TRÚC SỐ 5: Nuốt lỗi, không có Error Handler tập trung
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }
}
