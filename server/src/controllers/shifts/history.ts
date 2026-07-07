import { Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { ManualShiftInput, UpdateShiftInput, UpdateShiftSegmentInput } from 'shared';
import { dayKey, mergeShifts } from './helpers.js';

export const getShifts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const list = await prisma.shift.findMany({
      where: { userId },
      include: { segments: { include: { process: true } } },
      orderBy: { startTime: 'desc' },
    });
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const logManual = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { date, startTime, durationMinutes, processId, quantity } = req.body as ManualShiftInput;

    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    let targetShift = await prisma.shift.findFirst({
      where: { userId, date, isFinalized: true },
    });

    if (!targetShift) {
      targetShift = await prisma.shift.create({
        data: { userId, date, startTime: start, endTime: end, isFinalized: true },
      });
    } else {
      const newStart = start < targetShift.startTime ? start : targetShift.startTime;
      const newEnd = end > (targetShift.endTime || targetShift.startTime) ? end : targetShift.endTime;
      await prisma.shift.update({
        where: { id: targetShift.id },
        data: { startTime: newStart, endTime: newEnd },
      });
    }

    await prisma.shiftSegment.create({
      data: {
        shiftId: targetShift.id,
        processId,
        startTime: start,
        endTime: end,
        quantity,
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteShift = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await prisma.shift.delete({ where: { id, userId } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateShift = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { startTime, endTime } = req.body as UpdateShiftInput;

    const data: any = {};
    if (startTime) {
      data.startTime = new Date(startTime);
      data.date = dayKey(data.startTime);
    }
    if (endTime) {
      data.endTime = new Date(endTime);
    }

    const updated = await prisma.shift.update({
      where: { id, userId },
      data,
    });

    if (updated.isFinalized) {
      await mergeShifts(userId, updated.id);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const updateSegment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { segmentId } = req.params;
    const { quantity, processId } = req.body as UpdateShiftSegmentInput;

    const segment = await prisma.shiftSegment.findUnique({
      where: { id: segmentId },
      include: { shift: true },
    });
    if (!segment || segment.shift.userId !== userId) {
      res.status(404).json({ success: false, error: { message: 'Segment not found' } });
      return;
    }

    const updated = await prisma.shiftSegment.update({
      where: { id: segmentId },
      data: { quantity, processId },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
