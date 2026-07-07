import { prisma } from '../config/db.js';

export const dayKey = (d: Date): string => d.toISOString().split('T')[0];

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

const migrateUsers = async (supabaseUsers: any[]) => {
  for (const su of supabaseUsers) {
    const meta = su.raw_user_meta_data ? JSON.parse(JSON.stringify(su.raw_user_meta_data)) : {};
    const name = meta.name || su.email.split('@')[0];

    await prisma.user.upsert({
      where: { id: su.id },
      update: {},
      create: {
        id: su.id,
        email: su.email,
        password: su.encrypted_password,
        name,
        role: 'CLIENT',
      },
    });
  }
};

const migrateUserSettings = async (userId: string, keys: any) => {
  if (!keys.settings) return;
  const s = keys.settings;
  await prisma.setting.upsert({
    where: { userId },
    update: {
      monthlySalary: s.baseSalary || 0,
      rateWeekdayOvertime: s.rateOvertime || 0,
      rateSaturdayOvertime: s.rateSaturday || 0,
      bonusTiers: s.bonusTiers || [],
    },
    create: {
      userId,
      monthlySalary: s.baseSalary || 0,
      rateWeekdayOvertime: s.rateOvertime || 0,
      rateSaturdayOvertime: s.rateSaturday || 0,
      bonusTiers: s.bonusTiers || [],
    },
  });
};

const migrateUserProcesses = async (userId: string, keys: any, processIdMap: Record<string, string>) => {
  if (!keys.processes_list) return;
  for (const p of keys.processes_list) {
    const existingProc = await prisma.process.findFirst({
      where: { userId, name: p.name }
    });
    if (existingProc) {
      processIdMap[p.id] = existingProc.id;
      processIdMap[p.name] = existingProc.id;
      continue;
    }

    const newProc = await prisma.process.create({
      data: { userId, name: p.name, normMinutes: p.normMinutes || 0 },
    });
    processIdMap[p.id] = newProc.id;
    processIdMap[p.name] = newProc.id;
  }
};

const migrateUserShifts = async (userId: string, keys: any, processIdMap: Record<string, string>) => {
  if (!keys.shifts_log) return;
  for (const oldShift of keys.shifts_log) {
    const start = new Date(oldShift.startTime);
    const end = oldShift.endTime ? new Date(oldShift.endTime) : null;

    const existingShift = await prisma.shift.findFirst({
      where: { userId, startTime: start }
    });
    if (existingShift) continue;

    const newShift = await prisma.shift.create({
      data: { userId, date: oldShift.startTime.split('T')[0], startTime: start, endTime: end, isFinalized: true },
    });

    if (oldShift.segments) {
      for (const seg of oldShift.segments) {
        const newProcId = processIdMap[seg.processId] || processIdMap[seg.processName];
        if (newProcId) {
          await prisma.shiftSegment.create({
            data: {
              shiftId: newShift.id,
              processId: newProcId,
              startTime: new Date(seg.startTime),
              endTime: seg.endTime ? new Date(seg.endTime) : null,
              quantity: seg.units || 0,
            },
          });
        }
      }
    }
    await mergeShifts(userId, newShift.id);
  }
};

const runMigration = async () => {
  console.log('[Migration] Starting migration of old Supabase data...');
  try {
    const supabaseUsers: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, email, encrypted_password, raw_user_meta_data FROM auth.users`
    );
    await migrateUsers(supabaseUsers);

    const appDataRows = await prisma.$queryRawUnsafe(
      `SELECT user_id, key, value FROM public.app_data`
    );
    const userData: Record<string, Record<string, any>> = {};
    for (const row of appDataRows as any[]) {
      if (!userData[row.user_id]) userData[row.user_id] = {};
      userData[row.user_id][row.key] = row.value;
    }

    for (const [userId, keys] of Object.entries(userData)) {
      await migrateUserSettings(userId, keys);
      const processIdMap: Record<string, string> = {};
      await migrateUserProcesses(userId, keys, processIdMap);
      await migrateUserShifts(userId, keys, processIdMap);
    }
    console.log('[Migration] All user data successfully migrated!');
  } catch (err) {
    console.error('[Migration] Migration error occurred:', err);
  } finally {
    await prisma.$disconnect();
  }
};

runMigration();
