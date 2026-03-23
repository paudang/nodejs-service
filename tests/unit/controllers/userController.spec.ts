import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import { UserController } from '@/controllers/userController';
import User from '@/models/User';
import cacheService from '@/config/redisClient';

// Mock dependencies
jest.mock('@/models/User');
jest.mock('@/config/redisClient', () => ({
    getOrSet: jest.fn(),
    del: jest.fn()
}));
jest.mock('@/utils/logger');


describe('UserController', () => {
    let userController: UserController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        userController = new UserController();
        mockRequest = {};
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should return successfully (Happy Path)', async () => {
            // Arrange
            const usersMock = [{ id: '1', name: 'Test', email: 'test@example.com' }];
            (cacheService.getOrSet as jest.Mock).mockResolvedValue(usersMock);

            // Act
            await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith(usersMock);
            expect(cacheService.getOrSet).toHaveBeenCalled();
        });

        it('should handle errors correctly (Error Handling)', async () => {
            // Arrange
            const error = new Error('Database Error');
            (cacheService.getOrSet as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await userController.getUsers(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('createUser', () => {
        it('should successfully create a new user (Happy Path)', async () => {
            // Arrange
            const payload = { name: 'Alice', email: 'alice@example.com' };
            mockRequest.body = payload;
            
            const expectedUser = { id: '1', ...payload };
            (User.create as jest.Mock).mockResolvedValue(expectedUser);

            // Act
            await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
            expect(User.create).toHaveBeenCalledWith(payload);
            expect(cacheService.del).toHaveBeenCalledWith('users:all');
        });

        it('should handle errors when creation fails (Error Handling)', async () => {
            // Arrange
            const error = new Error('Creation Error');
            const payload = { name: 'Bob', email: 'bob@example.com' };
            mockRequest.body = payload;

            (User.create as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
