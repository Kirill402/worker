import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getShiftsApi } from '../../shifts/api/shifts';
import { getSettingsApi } from '../../settings/api/settings';
import { ShiftTimer } from '../../shifts/components/ShiftTimer';
import { ManualShiftForm } from '../../shifts/components/ManualShiftForm';
import { ShiftsHistory } from '../../shifts/components/ShiftsHistory';
import { ManageProcesses } from '../../processes/components/ManageProcesses';
import { SalarySettings } from '../../settings/components/SalarySettings';
import { StatsSummary } from '../components/StatsSummary';
import { LogOut } from 'lucide-react';

interface DashboardPageProps {
  userName: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ userName, onLogout }) => {
  const { data: shifts = [] } = useQuery({ queryKey: ['shifts'], queryFn: getShiftsApi });
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettingsApi });

  const activeShifts = shifts.filter((s) => s.isFinalized);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col">
      <header className="border-b border-white/5 bg-[#111118]/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white font-sans">Рабочий Кабинет</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">Здравствуйте, <span className="font-semibold text-white">{userName}</span></span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-950/20 hover:text-red-400 border border-white/5 transition-all text-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StatsSummary shifts={activeShifts} settings={settings} />
            <ShiftTimer />
            <ShiftsHistory shifts={activeShifts} />
          </div>
          <div className="space-y-6">
            <SalarySettings />
            <ManageProcesses />
            <ManualShiftForm />
          </div>
        </div>
      </main>
    </div>
  );
};
