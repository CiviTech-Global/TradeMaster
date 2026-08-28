import { describe, it, expect } from 'vitest';
import {
  signupSchema,
  signinSchema,
  createBusinessSchema,
  createProductSchema,
  createOrderSchema,
  sendMessageSchema,
  createReviewSchema,
} from '../infrastructure.layer/validation/schemas';

describe('Auth Validation Schemas', () => {
  describe('signupSchema', () => {
    it('should accept valid signup data', () => {
      const result = signupSchema.safeParse({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        consent_given: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = signupSchema.safeParse({
        firstname: 'John',
        lastname: 'Doe',
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = signupSchema.safeParse({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const result = signupSchema.safeParse({
        firstname: 'John',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('signinSchema', () => {
    it('should accept valid signin data', () => {
      const result = signinSchema.safeParse({
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = signinSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Business Validation Schemas', () => {
  describe('createBusinessSchema', () => {
    it('should accept valid business data', () => {
      const result = createBusinessSchema.safeParse({
        title: 'My Shop',
        longitude: -73.935242,
        latitude: 40.73061,
        address: '123 Main St, New York, NY',
        emails: ['shop@example.com'],
        phones: ['+1234567890'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid longitude', () => {
      const result = createBusinessSchema.safeParse({
        title: 'My Shop',
        longitude: 200,
        latitude: 40.73061,
        address: '123 Main St',
        emails: ['shop@example.com'],
        phones: ['+1234567890'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email in emails array', () => {
      const result = createBusinessSchema.safeParse({
        title: 'My Shop',
        longitude: -73.935242,
        latitude: 40.73061,
        address: '123 Main St',
        emails: ['not-an-email'],
        phones: ['+1234567890'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty emails array', () => {
      const result = createBusinessSchema.safeParse({
        title: 'My Shop',
        longitude: -73.935242,
        latitude: 40.73061,
        address: '123 Main St',
        emails: [],
        phones: ['+1234567890'],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Product Validation Schemas', () => {
  describe('createProductSchema', () => {
    it('should accept valid product data', () => {
      const result = createProductSchema.safeParse({
        business_id: 1,
        title: 'Test Product',
        price: 29.99,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const result = createProductSchema.safeParse({
        business_id: 1,
        title: 'Test Product',
        price: -10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing title', () => {
      const result = createProductSchema.safeParse({
        business_id: 1,
        price: 29.99,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Order Validation Schemas', () => {
  describe('createOrderSchema', () => {
    it('should accept valid order data', () => {
      const result = createOrderSchema.safeParse({
        business_id: 1,
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty items array', () => {
      const result = createOrderSchema.safeParse({
        business_id: 1,
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject item with quantity < 1', () => {
      const result = createOrderSchema.safeParse({
        business_id: 1,
        items: [{ product_id: 1, quantity: 0 }],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Message Validation Schemas', () => {
  describe('sendMessageSchema', () => {
    it('should accept valid message data', () => {
      const result = sendMessageSchema.safeParse({
        receiver_id: 2,
        content: 'Hello!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const result = sendMessageSchema.safeParse({
        receiver_id: 2,
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject content exceeding 5000 characters', () => {
      const result = sendMessageSchema.safeParse({
        receiver_id: 2,
        content: 'x'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Review Validation Schemas', () => {
  describe('createReviewSchema', () => {
    it('should accept valid review data', () => {
      const result = createReviewSchema.safeParse({
        business_id: 1,
        rating: 5,
        comment: 'Great shop!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject rating < 1', () => {
      const result = createReviewSchema.safeParse({
        business_id: 1,
        rating: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject rating > 5', () => {
      const result = createReviewSchema.safeParse({
        business_id: 1,
        rating: 6,
      });
      expect(result.success).toBe(false);
    });

    it('should accept review without comment', () => {
      const result = createReviewSchema.safeParse({
        business_id: 1,
        rating: 4,
      });
      expect(result.success).toBe(true);
    });
  });
});
