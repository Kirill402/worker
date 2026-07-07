import { Router, Response, NextFunction } from 'express';
import { processSchema, ProcessInput, ApiResponse } from 'shared';
import { validate } from '../middleware/validate.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/db.js';

const router = Router();

const getProcesses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const processes = await prisma.process.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    const response: ApiResponse = { success: true, data: processes };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const createProcess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, normMinutes } = req.body as ProcessInput;

    const newProcess = await prisma.process.create({
      data: {
        userId,
        name,
        normMinutes,
      },
    });

    const response: ApiResponse = { success: true, data: newProcess };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const deleteProcess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await prisma.process.delete({
      where: { id, userId },
    });

    const response: ApiResponse = { success: true };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

router.get('/', requireAuth, getProcesses);
router.post('/', requireAuth, validate(processSchema), createProcess);
router.delete('/:id', requireAuth, deleteProcess);

export { router as processesRouter };
