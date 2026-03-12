import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import User from '@/models/User';
import logger from '@/utils/logger';
import cacheService from '@/config/redisClient';

export class UserController {
    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await cacheService.getOrSet('users:all', async () => {
                return await User.findAll();
            }, 60);
            res.json(users);
        } catch (error) {
            logger.error('Error fetching user:', error);
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email } = req.body;
            const user = await User.create({ name, email });
            await cacheService.del('users:all');
            res.status(HTTP_STATUS.CREATED).json(user);
        } catch (error) {
            logger.error('Error creating user:', error);
            next(error);
        }
    }
}
