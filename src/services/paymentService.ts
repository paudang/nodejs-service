import { PaymentRepository } from '../repositories/paymentRepository';
import { StripePaymentGateway } from '../gateways/stripePaymentGateway';

export class PaymentService {
  private readonly paymentRepository: PaymentRepository;
  private readonly stripePaymentGateway: StripePaymentGateway;

  constructor(paymentRepository: PaymentRepository, stripePaymentGateway: StripePaymentGateway) {
    this.paymentRepository = paymentRepository;
    this.stripePaymentGateway = stripePaymentGateway;
  }

  async createPayment(paymentData: any) {
    // Filter and validate paymentData before passing to repository
    const filteredData = this.filterPaymentData(paymentData);
    
    // Process payment
    await this.stripePaymentGateway.processPayment(filteredData.amount);
    
    // Save to database
    const newPayment = await this.paymentRepository.create(filteredData);
    return newPayment;
  }

  private filterPaymentData(paymentData: any) {
    // Implement filtering logic here to prevent Mass Assignment
    return { amount: paymentData.amount };
  }
}
