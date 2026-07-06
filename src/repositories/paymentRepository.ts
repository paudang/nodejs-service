import { PaymentModel } from '../models/paymentModel';

export class PaymentRepository {
  async create(paymentData: any) {
    const newPayment = await PaymentModel.create(paymentData);
    return newPayment;
  }
}
