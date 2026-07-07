import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createManualShiftApi } from '../api/shifts';
import { getProcessesApi } from '../../processes/api/processes';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

export const ManualShiftForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: processes = [] } = useQuery({ queryKey: ['processes'], queryFn: getProcessesApi });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    hours: '8',
    minutes: '0',
    processId: '',
    quantity: '0',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: createManualShiftApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setFormData((prev) => ({ ...prev, quantity: '0' }));
      alert('Смена успешно добавлена!');
    },
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { date, startTime, hours, minutes, processId, quantity } = formData;
    const targetProcessId = processId || (processes[0]?.id || '');
    if (!targetProcessId) return setError('Выберите деталь');

    const durationMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) return setError('Укажите корректную длительность');

    const isoStart = new Date(`${date}T${startTime}:00`).toISOString();

    createMutation.mutate({
      date,
      startTime: isoStart,
      durationMinutes,
      processId: targetProcessId,
      quantity: parseInt(quantity, 10) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
      <h2 className="text-xl font-bold tracking-tight text-white font-sans">Ввести смену вручную</h2>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Дата"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
        />
        <Input
          label="Время начала"
          type="time"
          value={formData.startTime}
          onChange={(e) => handleInputChange('startTime', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Длительность (Часы)"
          type="number"
          value={formData.hours}
          onChange={(e) => handleInputChange('hours', e.target.value)}
          min="0"
        />
        <Input
          label="Минуты"
          type="number"
          value={formData.minutes}
          onChange={(e) => handleInputChange('minutes', e.target.value)}
          min="0"
          max="59"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Деталь</label>
          <select
            value={formData.processId || (processes[0]?.id || '')}
            onChange={(e) => handleInputChange('processId', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-[#0a0a0f] border border-white/10"
          >
            <option value="">-- Выберите деталь --</option>
            {processes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Количество (шт)"
          type="number"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          min="0"
        />
      </div>

      <Button type="submit" isLoading={createMutation.isPending} className="w-full mt-2">
        Сохранить запись
      </Button>
    </form>
  );
};
