import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { JwtService } from '@/services/jwtService';
import logger from '@/utils/logger';
import { HTTP_STATUS } from '@/utils/httpCodes';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password!);
      if (!isPasswordValid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid credentials' });
      }

      const userId = String(user.id || (user as unknown as { _id?: string | number })._id);

      const accessToken = JwtService.generateToken({ id: userId, email: user.email });
      const refreshToken = JwtService.generateRefreshToken({ id: userId, email: user.email });

      const refreshJti = JwtService.decodeToken(refreshToken)?.jti;

      // Store refresh token

      const activeTokens = JwtService.activeRefreshTokens.get(userId) || [];
      activeTokens.push(refreshJti!);
      JwtService.activeRefreshTokens.set(userId, activeTokens);

      res.json({ token: accessToken, accessToken, refreshToken });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Refresh token is required' });
      }

      const decoded = JwtService.verifyRefreshToken(refreshToken);
      if (!decoded || !decoded.id || !decoded.jti) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid refresh token' });
      }

      const userId = String(decoded.id);
      const incomingJti = decoded.jti;

      let activeTokens = JwtService.activeRefreshTokens.get(userId) || [];

      if (!activeTokens.includes(incomingJti)) {
        // Theft detection!
        logger.warn(`Token theft detected for user ${userId}. Revoking all sessions.`);
        JwtService.activeRefreshTokens.delete(userId);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid session' });
      }

      activeTokens = activeTokens.filter((t) => t !== incomingJti);
      const newAccessToken = JwtService.generateToken({ id: userId, email: decoded.email });
      const newRefreshToken = JwtService.generateRefreshToken({ id: userId, email: decoded.email });
      const newRefreshJti = JwtService.decodeToken(newRefreshToken)?.jti;

      activeTokens.push(newRefreshJti!);
      JwtService.activeRefreshTokens.set(userId, activeTokens);

      res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
      logger.error('Refresh token error:', error);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'No token provided' });
      }

      const accessTokenStr = authHeader.split(' ')[1];
      const decodedAccess = JwtService.decodeToken(accessTokenStr);

      if (decodedAccess && decodedAccess.jti && decodedAccess.exp) {
        const remainingTime = Math.max(0, decodedAccess.exp - Math.floor(Date.now() / 1000));

        if (remainingTime > 0) {
          JwtService.blacklistedTokens.set(decodedAccess.jti, Date.now() + remainingTime * 1000);
        }
      }

      const { refreshToken } = req.body;
      if (refreshToken) {
        const decodedRefresh = JwtService.decodeToken(refreshToken);
        if (decodedRefresh && decodedRefresh.id && decodedRefresh.jti) {
          const userId = String(decodedRefresh.id);

          let activeTokens = JwtService.activeRefreshTokens.get(userId) || [];
          activeTokens = activeTokens.filter((t) => t !== decodedRefresh.jti);
          JwtService.activeRefreshTokens.set(userId, activeTokens);
        }
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }
}
