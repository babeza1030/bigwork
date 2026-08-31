import { Request, Response, NextFunction } from 'express';
import { authService } from './service';
import { registerSchema, loginSchema } from './validation';
import { AuthRequest } from '../../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json({
        message: 'Registration successful',
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        res.status(409).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json({
        message: 'Login successful',
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        res.status(401).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
