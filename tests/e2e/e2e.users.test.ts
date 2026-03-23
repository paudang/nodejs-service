import request from 'supertest';

const SERVER_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3001}`;

describe('E2E User Tests', () => {
  // Global setup and teardown hooks can be added here
  // typically for database seeding or external authentication checks prior to E2E.
  const uniqueEmail = `test_${Date.now()}@example.com`;

  it('should create a user successfully via REST', async () => {
    const response = await request(SERVER_URL)
      .post('/api/users')
      .send({ name: 'Test User', email: uniqueEmail });

    // E2E Tests must have strict and deterministic assertions
    expect(response.statusCode).toBe(201);
  });
});
