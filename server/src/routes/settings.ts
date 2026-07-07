import { Router, Response, NextFunction } from 'express';
import { settingsSchema, SettingsInput, ApiResponse } from 'shared';
import { validate } from '../middleware/validate.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/db.js';

const router = Router();

const getSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    let settings = await prisma.setting.findUnique({ where: { userId } });

    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          userId,
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
      });
    }

    const response: ApiResponse = { success: true, data: settings };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { monthlySalary, rateWeekdayOvertime, rateSaturdayOvertime, bonusTiers } =
      req.body as SettingsInput;

    const updated = await prisma.setting.upsert({
      where: { userId },
      update: {
        monthlySalary,
        rateWeekdayOvertime,
        rateSaturdayOvertime,
        bonusTiers,
      },
      create: {
        userId,
        monthlySalary,
        rateWeekdayOvertime,
        rateSaturdayOvertime,
        bonusTiers,
      },
    });

    const response: ApiResponse = { success: true, data: updated };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

router.get('/', requireAuth, getSettings);
router.put('/', requireAuth, validate(settingsSchema), updateSettings);

export { router as settingsRouter };
