import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettingsApi, updateSettingsApi } from '../api/settings';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

export const SalarySettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettingsApi,
  });

  const [form, setForm] = useState({
    monthlySalary: 0,
    rateWeekdayOvertime: 0,
    rateSaturdayOvertime: 0,
    bonusTiers: [
      { threshold: 0, amount: 0 },
      { threshold: 0, amount: 0 },
      { threshold: 0, amount: 0 },
      { threshold: 0, amount: 0 },
    ],
  });

  useEffect(() => {
    if (settings) {
      setForm({
        monthlySalary: settings.monthlySalary,
        rateWeekdayOvertime: settings.rateWeekdayOvertime,
        rateSaturdayOvertime: settings.rateSaturdayOvertime,
        bonusTiers: Array.isArray(settings.bonusTiers)
          ? settings.bonusTiers
          : JSON.parse(settings.bonusTiers as any || '[]'),
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: updateSettingsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Настройки сохранены!');
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleTierChange = (index: number, key: 'threshold' | 'amount', value: string) => {
    setForm((prev) => {
      const updatedTiers = [...prev.bonusTiers];
      updatedTiers[index] = {
        ...updatedTiers[index],
        [key]: parseFloat(value) || 0,
      };
      return { ...prev, bonusTiers: updatedTiers };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
      <h2 className="text-xl font-bold tracking-tight text-white font-sans">Параметры расчёта</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Оклад в месяц (zł)"
          type="number"
          value={form.monthlySalary || ''}
          onChange={(e) => handleInputChange('monthlySalary', e.target.value)}
        />
        <Input
          label="Доплата будни сверх 8ч (zł/ч)"
          type="number"
          value={form.rateWeekdayOvertime || ''}
          onChange={(e) => handleInputChange('rateWeekdayOvertime', e.target.value)}
        />
        <Input
          label="Доплата суббота (zł/ч)"
          type="number"
          value={form.rateSaturdayOvertime || ''}
          onChange={(e) => handleInputChange('rateSaturdayOvertime', e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <p className="block text-sm font-medium text-gray-300">Пороги премий за выработку</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.bonusTiers.map((tier, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-xs text-gray-400">Порог {idx + 1}: за</span>
              <input
                type="number"
                value={tier.threshold || ''}
                onChange={(e) => handleTierChange(idx, 'threshold', e.target.value)}
                placeholder="0"
                className="w-16 px-2 py-1 rounded bg-[#0a0a0f] border border-white/10 text-sm text-center"
              />
              <span className="text-sm text-gray-400">%</span>
              <span className="text-xs text-gray-400">→ +</span>
              <input
                type="number"
                value={tier.amount || ''}
                onChange={(e) => handleTierChange(idx, 'amount', e.target.value)}
                placeholder="0"
                className="w-20 px-2 py-1 rounded bg-[#0a0a0f] border border-white/10 text-sm text-center"
              />
              <span className="text-sm text-gray-400">zł</span>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" isLoading={updateMutation.isPending} className="w-full">
        Сохранить настройки
      </Button>
    </form>
  );
};
