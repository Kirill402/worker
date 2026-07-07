import { Router, Request, Response, NextFunction } from 'express';
import { loginSchema, registerSchema, LoginInput, RegisterInput, ApiResponse, Session } from 'shared';
import { validate } from '../middleware/validate.js';
import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';

const router = Router();

const handleLogin = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' },
      });
      return;
    }

    const response: ApiResponse<Session> = {
      success: true,
      data: {
        token: `mock-jwt-token-${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
      },
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const handleRegister = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ success: false, error: { message: 'User already exists' } });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CLIENT',
        settings: {
          create: {
            monthlySalary: 0,
            rateWeekdayOvertime: 0,
            rateSaturdayOvertime: 0,
            bonusTiers: [
              { threshold: 0, amount: 0 },
              { threshold: 0, amount: 0 },
              { threshold: 0, amount: 0 },
              { threshold: 0, amount: 0 },
            ],
          },
        },
      },
    });

    const response: ApiResponse<Session> = {
      success: true,
      data: {
        token: `mock-jwt-token-${newUser.id}`,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          createdAt: newUser.createdAt.toISOString(),
        },
      },
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

router.post('/login', validate(loginSchema), handleLogin);
router.post('/register', validate(registerSchema), handleRegister);

export { router as authRouter };
