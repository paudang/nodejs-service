import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { handleError } from '../middlewares/errorHandler';

export class PaymentController {
  private readonly paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  async processPayment(req: Request, res: Response) {
    try {
      const newPayment = await this.paymentService.createPayment(req.body);
      return res.status(201).json(newPayment);
    } catch (error) {
      // Use a centralized error handler
      return handleError(error, res);
    }
  }
}
