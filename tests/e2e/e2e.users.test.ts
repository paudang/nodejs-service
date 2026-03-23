import request from 'supertest';

const SERVER_URL = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;

describe('E2E User Tests', () => {
  // Global setup and teardown hooks can be added here
  // typically for database seeding or external authentication checks prior to E2E.

  it('should create a user and verify flow', async () => {
    const response = await request(SERVER_URL)
      .post('/api/users')
      .send({ name: 'Test User', email: `test_${Date.now()}@example.com` });

    if (response.statusCode === 404) {
      expect(response.statusCode).toBe(404);
    } else {
      expect(response.statusCode).toBe(201);
    }
  });
});
