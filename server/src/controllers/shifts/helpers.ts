import { prisma } from '../../config/db.js';

export const dayKey = (d: Date): string => {
  return d.toISOString().split('T')[0];
};

export const mergeShifts = async (userId: string, shiftId: string) => {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { segments: true },
  });
  if (!shift || !shift.endTime) return;

  const existing = await prisma.shift.findFirst({
    where: { userId, date: shift.date, isFinalized: true, NOT: { id: shiftId } },
  });
  if (!existing) return;

  await prisma.shiftSegment.updateMany({
    where: { shiftId: shift.id },
    data: { shiftId: existing.id },
  });

  const newStart = shift.startTime < existing.startTime ? shift.startTime : existing.startTime;
  const newEnd = shift.endTime > (existing.endTime || existing.startTime) ? shift.endTime : existing.endTime;

  await prisma.shift.update({
    where: { id: existing.id },
    data: { startTime: newStart, endTime: newEnd },
  });

  await prisma.shift.delete({ where: { id: shift.id } });
};
