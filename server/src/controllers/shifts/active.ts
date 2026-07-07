import { Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { dayKey, mergeShifts } from './helpers.js';

export const startShift = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const active = await prisma.shift.findFirst({
      where: { userId, isFinalized: false },
    });
    if (active) {
      res.status(400).json({ success: false, error: { message: 'A shift is already active' } });
      return;
    }

    const now = new Date();
    const newShift = await prisma.shift.create({
      data: {
        userId,
        date: dayKey(now),
        startTime: now,
      },
    });
    res.status(201).json({ success: true, data: newShift });
  } catch (error) {
    next(error);
  }
};

export const startSegment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { processId, quantity } = req.body;

    const active = await prisma.shift.findFirst({
      where: { userId, isFinalized: false },
      include: { segments: true },
    });
    if (!active) {
      res.status(400).json({ success: false, error: { message: 'No active shift found' } });
      return;
    }

    const running = active.segments.find((s) => !s.endTime);
    if (running) {
      await prisma.shiftSegment.update({
        where: { id: running.id },
        data: { endTime: new Date(), quantity: quantity || 0 },
      });
    }

    const newSegment = await prisma.shiftSegment.create({
      data: {
        shiftId: active.id,
        processId,
        startTime: new Date(),
      },
    });

    res.json({ success: true, data: newSegment });
  } catch (error) {
    next(error);
  }
};

export const endSegment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { quantity } = req.body;

    const active = await prisma.shift.findFirst({
      where: { userId, isFinalized: false },
      include: { segments: true },
    });
    if (!active) {
      res.status(400).json({ success: false, error: { message: 'No active shift found' } });
      return;
    }

    const running = active.segments.find((s) => !s.endTime);
    if (!running) {
      res.status(400).json({ success: false, error: { message: 'No active segment to stop' } });
      return;
    }

    const updated = await prisma.shiftSegment.update({
      where: { id: running.id },
      data: { endTime: new Date(), quantity: quantity || 0 },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const closeShift = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { quantity } = req.body;

    const active = await prisma.shift.findFirst({
      where: { userId, isFinalized: false },
      include: { segments: true },
    });
    if (!active) {
      res.status(400).json({ success: false, error: { message: 'No active shift found' } });
      return;
    }

    const running = active.segments.find((s) => !s.endTime);
    if (running) {
      await prisma.shiftSegment.update({
        where: { id: running.id },
        data: { endTime: new Date(), quantity: quantity || 0 },
      });
    }

    const now = new Date();
    await prisma.shift.update({
      where: { id: active.id },
      data: { isFinalized: true, endTime: now },
    });

    await mergeShifts(userId, active.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
