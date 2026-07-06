import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2024-04-10',
});

export class StripePaymentGateway {
  async processPayment(amount: number) {
    // Implement payment processing logic here
    return true;
  }
}
