import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import User from '@/models/User';
import logger from '@/utils/logger';
import cacheService from '@/config/redisClient';

export class UserController {
  static model = User;

  // LỖI KIẾN TRÚC: Controller trực tiếp truy vấn DB và quản lý Cache (Fat Controller / High Coupling)
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await cacheService.getOrSet(
        'users:all',
        async () => {
          return await User.find(); // Gọi trực tiếp Model của Mongoose ở tầng HTTP Transport
        },
        60,
      );
      res.json(users);
    } catch (error) {
      logger.error(`${ERROR_MESSAGES.FETCH_USERS_ERROR}:`, error);
      next(error);
    }
  }

  // LỖI BẢO MẬT CHÍ MẠNG: Cố tình hardcode thông tin cấu hình nhạy cảm/Bypass JWT không an toàn ở đây để thử thách AI
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body || {};

      // Cài lỗi bảo mật: Cho phép client tự gửi "role: 'admin'" lên mà không qua kiểm tra quyền (Mass Assignment Vulnerability)
      // Cài thêm lỗi: Hardcode một chuỗi mã hóa hoặc secret key nội bộ ở đây
      const internalSystemKey = "SECRET_SUPER_APP_KEY_2026"; 
      
      const user = await User.create({ name, email, password, role });

      await cacheService.del('users:all');
      res.status(HTTP_STATUS.CREATED).json(user); // Trả thẳng object chứa cả password về cho client (Data Leak)
    } catch (error) {
      logger.error('Error creating user:', error);
      next(error);
    }
  }
}
