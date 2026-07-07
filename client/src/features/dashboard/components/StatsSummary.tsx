import React, { useState } from 'react';
import { useSalaryCalc } from '../../shifts/hooks/useSalaryCalc';
import { Shift, Setting } from 'shared';

interface StatsSummaryProps {
  shifts: Shift[];
  settings?: Setting;
}

const fmtMoney = (val: number): string => `${val.toFixed(2)} zł`;

const fmtHours = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}ч ${m}м`;
};

export const StatsSummary: React.FC<StatsSummaryProps> = ({ shifts, settings }) => {
  const { computeMonthlySalary } = useSalaryCalc();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const stats = computeMonthlySalary(selectedMonth, shifts, settings);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Зарплата и статистика</h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-xs text-white"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-xl text-center space-y-1">
          <span className="text-xs text-gray-400">Смен в месяце</span>
          <p className="text-2xl font-bold text-white">{stats.shiftsCount}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center space-y-1">
          <span className="text-xs text-gray-400">Средняя выработка</span>
          <p className="text-2xl font-bold text-primary-400">
            {stats.avgEff !== null ? `${stats.avgEff.toFixed(0)}%` : '—'}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center space-y-1">
          <span className="text-xs text-gray-400">Всего отработано</span>
          <p className="text-2xl font-bold text-accent-emerald">{fmtHours(stats.hoursTotal)}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center space-y-1">
          <span className="text-xs text-gray-400">Итого брутто</span>
          <p className="text-2xl font-black text-white">{fmtMoney(stats.total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-300">Детализация начислений</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Оклад:</span>
              <span className="text-white font-medium">{fmtMoney(settings?.monthlySalary || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Премия за выработку:</span>
              <span className="text-white font-medium">{fmtMoney(stats.bonus)}</span>
            </div>
            <div className="flex justify-between">
              <span>Доплата за переработки:</span>
              <span className="text-white font-medium">{fmtMoney(stats.overtimeSum)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-300">Распределение часов</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Будни (основные 8ч):</span>
              <span className="text-white font-medium">{fmtHours(stats.hoursRegular)}</span>
            </div>
            <div className="flex justify-between">
              <span>Будни (переработка):</span>
              <span className="text-white font-medium">{fmtHours(stats.hoursOvertime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Выходные (суббота):</span>
              <span className="text-white font-medium">{fmtHours(stats.hoursWeekend)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
