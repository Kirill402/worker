import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShiftsApi, startShiftApi, startSegmentApi, closeShiftApi, updateShiftApi } from '../api/shifts';
import { getProcessesApi } from '../../processes/api/processes';
import { useStopwatches } from '../hooks/useStopwatches';
import { Button } from '../../../shared/components/Button';
import { Play, Square, RefreshCw, Edit2 } from 'lucide-react';

const fmtDuration = (ms: number): string => {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const ShiftTimer: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: shifts = [] } = useQuery({ queryKey: ['shifts'], queryFn: getShiftsApi });
  const { data: processes = [] } = useQuery({ queryKey: ['processes'], queryFn: getProcessesApi });

  const activeShift = shifts.find((s) => !s.isFinalized);
  const activeSegment = activeShift?.segments.find((seg) => !seg.endTime);

  const { shift: shiftMs, segment: segMs } = useStopwatches(
    activeShift?.startTime,
    activeSegment?.startTime
  );

  const [state, setState] = useState({
    processId: '',
    quantity: '0',
    isEditingStart: false,
    editStartTime: '',
  });

  useEffect(() => {
    if (processes.length > 0 && !state.processId) {
      setState((prev) => ({ ...prev, processId: processes[0].id }));
    }
  }, [processes, state.processId]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['shifts'] });

  const startShiftMut = useMutation({ mutationFn: startShiftApi, onSuccess: invalidate });
  const closeShiftMut = useMutation({ mutationFn: closeShiftApi, onSuccess: invalidate });
  const startSegMut = useMutation({ mutationFn: startSegmentApi, onSuccess: invalidate });
  const updateShiftMut = useMutation({
    mutationFn: ({ id, data }: any) => updateShiftApi(id, data),
    onSuccess: () => {
      invalidate();
      setState((prev) => ({ ...prev, isEditingStart: false }));
    },
  });

  const handleStartProcess = () => {
    if (!state.processId) return;
    startSegMut.mutate({ processId: state.processId });
  };

  const handleSwitchProcess = () => {
    if (!state.processId) return;
    startSegMut.mutate({ processId: state.processId, quantity: parseInt(state.quantity, 10) || 0 });
    setState((prev) => ({ ...prev, quantity: '0' }));
  };

  const handleStopShift = () => {
    closeShiftMut.mutate({ quantity: parseInt(state.quantity, 10) || 0 });
    setState((prev) => ({ ...prev, quantity: '0' }));
  };

  const handleStartEdit = () => {
    if (!activeShift) return;
    const d = new Date(activeShift.startTime);
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    setState((prev) => ({ ...prev, isEditingStart: true, editStartTime: timeStr }));
  };

  const handleSaveStartTime = () => {
    if (!activeShift || !state.editStartTime) return;
    const [hh, mm] = state.editStartTime.split(':').map(Number);
    const newStart = new Date(activeShift.startTime);
    newStart.setHours(hh, mm, 0, 0);
    updateShiftMut.mutate({ id: activeShift.id, data: { startTime: newStart.toISOString() } });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      
      {!activeShift ? (
        <div className="py-8 space-y-4">
          <p className="text-gray-400 text-sm">Смена не начата</p>
          <Button onClick={() => startShiftMut.mutate()} isLoading={startShiftMut.isPending} className="px-8 py-4 text-base">
            <Play className="w-5 h-5 fill-current" /> Начать смену
          </Button>
        </div>
      ) : (
        <div className="w-full space-y-6">
          <div className="space-y-1">
            <span className="text-xs text-primary-400 font-bold uppercase tracking-wider">Длительность смены</span>
            <h3 className="text-5xl font-black font-sans tracking-tight text-white">{fmtDuration(shiftMs)}</h3>
            
            {state.isEditingStart ? (
              <div className="flex justify-center items-center gap-2 mt-2">
                <input
                  type="time"
                  value={state.editStartTime}
                  onChange={(e) => setState((prev) => ({ ...prev, editStartTime: e.target.value }))}
                  className="px-2 py-1 text-xs bg-[#0a0a0f] border border-white/10 rounded text-white font-sans"
                />
                <Button onClick={handleSaveStartTime} variant="success" className="px-2 py-1 text-xs" isLoading={updateShiftMut.isPending}>OK</Button>
                <Button onClick={() => setState((prev) => ({ ...prev, isEditingStart: false }))} variant="secondary" className="px-2 py-1 text-xs">X</Button>
              </div>
            ) : (
              <button onClick={handleStartEdit} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mx-auto mt-2 transition-colors">
                <Edit2 className="w-3 h-3" /> изменить время начала
              </button>
            )}
          </div>

          {activeSegment ? (
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-left space-y-4">
              <div>
                <span className="text-xs text-accent-emerald font-semibold">Текущий процесс</span>
                <p className="text-lg font-bold text-white">{activeSegment.process?.name}</p>
                <p className="text-xs text-gray-400">Работает: {fmtDuration(segMs)}</p>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Количество деталей (шт)</label>
                  <input
                    type="number"
                    value={state.quantity}
                    onChange={(e) => setState((prev) => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-white/10 text-sm text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={state.processId}
                    onChange={(e) => setState((prev) => ({ ...prev, processId: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-[#0a0a0f] border border-white/10 text-sm text-white max-w-[150px]"
                  >
                    {processes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleSwitchProcess} variant="secondary" isLoading={startSegMut.isPending}>
                    <RefreshCw className="w-4 h-4" /> Переключить
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
              <p className="text-xs text-gray-400">Выберите деталь для запуска процесса:</p>
              <div className="flex gap-3 justify-center">
                <select
                  value={state.processId}
                  onChange={(e) => setState((prev) => ({ ...prev, processId: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[#0a0a0f] border border-white/10 text-sm text-white"
                >
                  {processes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {processes.length === 0 && <option value="">Сначала добавьте детали</option>}
                </select>
                <Button onClick={handleStartProcess} disabled={processes.length === 0} isLoading={startSegMut.isPending}>
                  Запустить процесс
                </Button>
              </div>
            </div>
          )}

          <Button onClick={handleStopShift} variant="danger" isLoading={closeShiftMut.isPending} className="w-full py-3">
            <Square className="w-4 h-4 fill-current" /> Закончить смену
          </Button>
        </div>
      )}
    </div>
  );
};
