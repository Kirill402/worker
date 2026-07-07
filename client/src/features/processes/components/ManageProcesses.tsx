import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProcessesApi, createProcessApi, deleteProcessApi } from '../api/processes';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Trash2 } from 'lucide-react';

export const ManageProcesses: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: processes = [] } = useQuery({
    queryKey: ['processes'],
    queryFn: getProcessesApi,
  });

  const [name, setName] = useState('');
  const [norm, setNorm] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: createProcessApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      setName('');
      setNorm('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProcessApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const minutes = parseFloat(norm);
    if (!name.trim()) return setError('Название обязательно');
    if (isNaN(minutes) || minutes <= 0) return setError('Норма должна быть > 0');

    createMutation.mutate({ name, normMinutes: minutes });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
      <h2 className="text-xl font-bold tracking-tight text-white">Список деталей и норм</h2>

      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Деталь"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Напр. Болт М8"
          />
        </div>
        <div className="w-32">
          <Input
            label="Норма (мин/шт)"
            type="number"
            value={norm}
            step="0.1"
            onChange={(e) => setNorm(e.target.value)}
            placeholder="5"
          />
        </div>
        <Button type="submit" isLoading={createMutation.isPending}>
          Добавить
        </Button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {processes.map((p) => (
          <div key={p.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <div>
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-xs text-gray-400">Норма: {p.normMinutes} мин/шт</p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(p.id)}
              disabled={deleteMutation.isPending}
              className="p-2 text-gray-400 hover:text-accent-rose transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {processes.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Нет добавленных деталей.</p>
        )}
      </div>
    </div>
  );
};
