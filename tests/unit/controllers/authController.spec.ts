jest.mock('@/services/jwtService');
jest.mock('@/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

import { AuthController } from '@/controllers/authController';
import { JwtService } from '@/services/jwtService';
import User from '@/models/User';
import { HTTP_STATUS } from '@/utils/httpCodes';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

jest.mock('bcryptjs');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    authController = new AuthController();
    mockRequest = {
      body: {},
      headers: {},
      query: {},
      cookies: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 401 if user not found', async () => {
      mockRequest.body = { email: 'notfound@test.com', password: 'password' };
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should return 200 and a token if credentials are valid', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashedpassword' };
      mockRequest.body = { email: 'test@test.com', password: 'password123' };
      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (JwtService.generateToken as jest.Mock).mockReturnValue('mock-token');
      (JwtService.generateRefreshToken as jest.Mock).mockReturnValue('mock-refresh-token');
      (JwtService.decodeToken as jest.Mock).mockReturnValue({ jti: 'test-jti' });

      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: 'mock-token' }),
      );
    });

    it('should return 401 if password is invalid', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashedpassword' };
      mockRequest.body = { email: 'test@test.com', password: 'wrongpassword' };
      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should call next with error if login fails', async () => {
      const error = new Error('Login failed');
      (User.findOne as jest.Mock).mockRejectedValue(error);
      mockRequest.body = { email: 'test@test.com', password: 'password123' };

      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('refresh', () => {
    it('should return 401 if refresh token is invalid', async () => {
      mockRequest.body = { refreshToken: 'invalid-token' };
      (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(null);

      await authController.refresh(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should return 400 if refresh token is missing', async () => {
      mockRequest.body = {};

      await authController.refresh(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should return new tokens if refresh token is valid', async () => {
      mockRequest.body = { refreshToken: 'valid-token' };
      const decoded = { id: '1', email: 'test@test.com', jti: 'test-jti' };
      (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(decoded);
      (JwtService.generateRefreshToken as jest.Mock).mockReturnValue('new-refresh-token');
      (JwtService.generateToken as jest.Mock).mockReturnValue('new-access-token');
      (JwtService.decodeToken as jest.Mock).mockReturnValue({ jti: 'new-jti' });

      JwtService.activeRefreshTokens.set('1', ['test-jti']);

      await authController.refresh(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: 'new-access-token' }),
      );
    });

    it('should detect token theft if jti is not in active tokens', async () => {
      mockRequest.body = { refreshToken: 'valid-token' };
      const decoded = { id: '1', email: 'test@test.com', jti: 'stolen-jti' };
      (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue(decoded);

      JwtService.activeRefreshTokens.set('1', ['other-jti']);

      await authController.refresh(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should call next with error if refresh fails', async () => {
      const error = new Error('Refresh failed');
      (JwtService.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw error;
      });
      mockRequest.body = { refreshToken: 'token' };

      await authController.refresh(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('should return 400 if no token provided', async () => {
      mockRequest.headers = {};
      await authController.logout(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should logout successfully', async () => {
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      mockRequest.body = { refreshToken: 'valid-refresh-token' };
      (JwtService.decodeToken as jest.Mock)
        .mockReturnValueOnce({ jti: 'access-jti', exp: Math.floor(Date.now() / 1000) + 3600 })
        .mockReturnValueOnce({ id: '1', jti: 'refresh-jti' });

      JwtService.activeRefreshTokens.set('1', ['refresh-jti']);

      await authController.logout(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });

    it('should call next with error if logout fails', async () => {
      const error = new Error('Logout failed');
      mockRequest.headers = { authorization: 'Bearer token' };
      (JwtService.decodeToken as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await authController.logout(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});
