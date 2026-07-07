import { Shift, ShiftSegment, Setting, SalaryCalculationResult } from 'shared';

const OT_WEEKDAY = 1.5;
const OT_WEEKEND = 2;

const getSegmentEarned = (shift: Shift, seg: ShiftSegment): number => {
  const norm = seg.process?.normMinutes || 0;
  const earned = seg.quantity * norm;
  if (earned <= 0) return 0;

  const start = new Date(seg.startTime).getTime();
  const end = seg.endTime ? new Date(seg.endTime).getTime() : start;
  const shiftStart = new Date(shift.startTime).getTime();

  const day = new Date(shiftStart).getDay();
  if (day === 6 || day === 0) {
    return earned / OT_WEEKEND;
  }

  const boundary = shiftStart + 8 * 3600000;
  if (end <= boundary) return earned;
  if (start >= boundary) return earned / OT_WEEKDAY;

  const span = end - start;
  if (span <= 0) return earned;
  const otFrac = (end - boundary) / span;
  return earned * (1 - otFrac) + (earned * otFrac) / OT_WEEKDAY;
};

const getSegmentActual = (seg: ShiftSegment): number => {
  const start = new Date(seg.startTime).getTime();
  const end = seg.endTime ? new Date(seg.endTime).getTime() : start;
  return Math.max(0, end - start) / 60000; // in minutes
};

export const useSalaryCalc = () => {
  const getShiftEffTotals = (shift: Shift) => {
    let earned = 0;
    let actual = 0;
    shift.segments.forEach((seg) => {
      earned += getSegmentEarned(shift, seg);
      actual += getSegmentActual(seg);
    });
    return { earned, actual };
  };

  const getShiftEfficiency = (shift: Shift): number | null => {
    const { earned, actual } = getShiftEffTotals(shift);
    return actual > 0 ? (earned / actual) * 100 : null;
  };

  const getOverallEfficiency = (shifts: Shift[]): number | null => {
    let totalEarned = 0;
    let totalActual = 0;
    shifts.forEach((s) => {
      let earned = 0;
      let actual = 0;
      s.segments.forEach((seg) => {
        earned += getSegmentEarned(s, seg);
        actual += getSegmentActual(seg);
      });
      totalEarned += earned;
      totalActual += actual;
    });
    return totalActual > 0 ? (totalEarned / totalActual) * 100 : null;
  };

  const calcOvertimePay = (shift: Shift, settings: Setting): number => {
    if (!shift.endTime) return 0;
    const start = new Date(shift.startTime).getTime();
    const end = new Date(shift.endTime).getTime();
    const hours = Math.max(0, end - start) / 3600000;

    const day = new Date(shift.startTime).getDay();
    if (day === 0) return 0; // Sundays are ignored
    if (day === 6) return hours * settings.rateSaturdayOvertime; // Saturdays
    return Math.max(0, hours - 8) * settings.rateWeekdayOvertime; // Weekdays
  };

  const computeMonthlySalary = (
    monthStr: string,
    shifts: Shift[],
    settings?: Setting
  ): SalaryCalculationResult => {
    const monthShifts = shifts.filter((s) => s.date.startsWith(monthStr));
    const avgEff = getOverallEfficiency(monthShifts);

    let bonus = 0;
    if (avgEff !== null && settings?.bonusTiers) {
      const tiers = Array.isArray(settings.bonusTiers)
        ? settings.bonusTiers
        : JSON.parse(settings.bonusTiers as any || '[]');
      tiers.forEach((t: any) => {
        if (avgEff >= t.threshold) bonus += t.amount;
      });
    }

    let overtimeSum = 0;
    let regular = 0;
    let overtime = 0;
    let weekend = 0;

    monthShifts.forEach((s) => {
      if (settings) overtimeSum += calcOvertimePay(s, settings);
      if (!s.endTime) return;
      const hours = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000;
      const day = new Date(s.startTime).getDay();
      if (day === 6 || day === 0) {
        weekend += hours;
      } else {
        regular += Math.min(hours, 8);
        overtime += Math.max(0, hours - 8);
      }
    });

    const baseSalary = settings?.monthlySalary || 0;
    return {
      avgEff,
      bonus,
      overtimeSum,
      total: baseSalary + bonus + overtimeSum,
      shiftsCount: monthShifts.length,
      hoursRegular: regular,
      hoursOvertime: overtime,
      hoursWeekend: weekend,
      hoursTotal: regular + overtime + weekend,
    };
  };

  return {
    getShiftEfficiency,
    getOverallEfficiency,
    computeMonthlySalary,
  };
};
