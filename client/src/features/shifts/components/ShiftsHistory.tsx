import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteShiftApi, updateShiftApi, updateShiftSegmentApi } from '../api/shifts';
import { getProcessesApi } from '../../processes/api/processes';
import { useSalaryCalc } from '../hooks/useSalaryCalc';
import { Button } from '../../../shared/components/Button';
import { Shift, ShiftSegment } from 'shared';
import { Trash2, Download, Edit2, Check, X } from 'lucide-react';

interface ShiftsHistoryProps {
  shifts: Shift[];
}

const fmtHM = (ms: number): string => {
  const min = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}ч ${m}м`;
};

const getEffClass = (pct: number | null): string => {
  if (pct === null) return 'pct-ok';
  if (pct > 125) return 'pct-over';
  if (pct >= 125 * 0.9) return 'pct-warn';
  return 'pct-ok';
};

export const ShiftsHistory: React.FC<ShiftsHistoryProps> = ({ shifts }) => {
  const queryClient = useQueryClient();
  const { getShiftEfficiency } = useSalaryCalc();
  const { data: processes = [] } = useQuery({ queryKey: ['processes'], queryFn: getProcessesApi });

  const [edit, setEdit] = useState({
    shiftId: null as string | null,
    startTime: '',
    endTime: '',
    segmentId: null as string | null,
    quantity: '',
    processId: '',
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['shifts'] });

  const deleteMutation = useMutation({
    mutationFn: deleteShiftApi,
    onSuccess: invalidate,
  });

  const updateShiftMut = useMutation({
    mutationFn: ({ id, data }: any) => updateShiftApi(id, data),
    onSuccess: () => {
      invalidate();
      cancelEdit();
    },
  });

  const updateSegMut = useMutation({
    mutationFn: ({ id, data }: any) => updateShiftSegmentApi(id, data),
    onSuccess: () => {
      invalidate();
      cancelEdit();
    },
  });

  const startEditShift = (s: Shift) => {
    setEdit({
      shiftId: s.id,
      startTime: new Date(s.startTime).toISOString().slice(0, 16),
      endTime: s.endTime ? new Date(s.endTime).toISOString().slice(0, 16) : '',
      segmentId: null,
      quantity: '',
      processId: '',
    });
  };

  const startEditSegment = (seg: ShiftSegment) => {
    setEdit({
      shiftId: null,
      startTime: '',
      endTime: '',
      segmentId: seg.id,
      quantity: String(seg.quantity),
      processId: seg.processId,
    });
  };

  const cancelEdit = () => {
    setEdit({ shiftId: null, startTime: '', endTime: '', segmentId: null, quantity: '', processId: '' });
  };

  const saveShiftEdit = () => {
    if (!edit.shiftId) return;
    const data: any = { startTime: new Date(edit.startTime).toISOString() };
    if (edit.endTime) data.endTime = new Date(edit.endTime).toISOString();
    updateShiftMut.mutate({ id: edit.shiftId, data });
  };

  const saveSegEdit = () => {
    if (!edit.segmentId) return;
    updateSegMut.mutate({
      id: edit.segmentId,
      data: { quantity: parseInt(edit.quantity, 10) || 0, processId: edit.processId },
    });
  };

  const handleExport = () => {
    const headers = ['Дата', 'Начало', 'Конец', 'Время смены (ч)', 'Детали', 'Кол-во (шт)', 'Эффективность %'];
    const rows = shifts.map((s) => {
      const startStr = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endStr = s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
      const hours = s.endTime ? ((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000).toFixed(2) : '—';
      const processesStr = s.segments.map((seg) => seg.process?.name || '—').join('; ');
      const quantityStr = s.segments.map((seg) => seg.quantity).join('; ');
      const eff = getShiftEfficiency(s);
      return [s.date, startStr, endStr, hours, processesStr, quantityStr, eff !== null ? `${eff.toFixed(0)}%` : '—'];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `shifts-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">История смен</h2>
        <Button onClick={handleExport} variant="secondary" className="px-3 py-1.5 text-xs">
          <Download className="w-3.5 h-3.5" /> Экспорт CSV
        </Button>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
        {shifts.map((s) => {
          const eff = getShiftEfficiency(s);
          const wallMs = s.endTime ? new Date(s.endTime).getTime() - new Date(s.startTime).getTime() : 0;
          const isEditingShift = edit.shiftId === s.id;

          return (
            <div key={s.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 relative group">
              <div className="flex justify-between items-start">
                {isEditingShift ? (
                  <div className="flex flex-col gap-2 bg-[#0a0a0f] p-3 rounded-lg border border-white/10 w-full md:w-auto">
                    <span className="text-xs text-gray-400">Редактирование времени смены</span>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="datetime-local"
                        value={edit.startTime}
                        onChange={(e) => setEdit((prev) => ({ ...prev, startTime: e.target.value }))}
                        className="px-2 py-1 bg-white/5 text-xs rounded border border-white/10 text-white"
                      />
                      <span className="text-xs text-gray-400">до</span>
                      <input
                        type="datetime-local"
                        value={edit.endTime}
                        onChange={(e) => setEdit((prev) => ({ ...prev, endTime: e.target.value }))}
                        className="px-2 py-1 bg-white/5 text-xs rounded border border-white/10 text-white"
                      />
                      <button onClick={saveShiftEdit} className="p-1 text-accent-emerald bg-white/5 rounded hover:bg-white/10">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-accent-rose bg-white/5 rounded hover:bg-white/10">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      {s.date}
                      <button onClick={() => startEditShift(s)} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-white transition-opacity">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </h4>
                    <p className="text-xs text-gray-400">
                      Время присутствия: {fmtHM(wallMs)} (
                      {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                      )
                    </p>
                  </div>
                )}
                {!isEditingShift && (
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-extrabold ${getEffClass(eff)}`}>
                      Выработка: {eff !== null ? `${eff.toFixed(0)}%` : '—'}
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(s.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-gray-400 hover:text-accent-rose rounded bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/5">
                {s.segments.map((seg) => {
                  const segWallMs = seg.endTime ? new Date(seg.endTime).getTime() - new Date(seg.startTime).getTime() : 0;
                  const isEditingSeg = edit.segmentId === seg.id;

                  return isEditingSeg ? (
                    <div key={seg.id} className="flex flex-wrap gap-2 items-center p-2 bg-black/30 rounded border border-white/5">
                      <select
                        value={edit.processId}
                        onChange={(e) => setEdit((prev) => ({ ...prev, processId: e.target.value }))}
                        className="px-2 py-1 bg-[#0a0a0f] text-xs rounded border border-white/10 text-white"
                      >
                        {processes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={edit.quantity}
                        onChange={(e) => setEdit((prev) => ({ ...prev, quantity: e.target.value }))}
                        className="w-16 px-2 py-1 bg-[#0a0a0f] text-xs rounded border border-white/10 text-white text-center"
                      />
                      <button onClick={saveSegEdit} className="p-1 text-accent-emerald bg-white/5 rounded hover:bg-white/10">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-accent-rose bg-white/5 rounded hover:bg-white/10">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div key={seg.id} className="flex justify-between text-xs text-gray-300 group/seg items-center">
                      <span className="flex items-center gap-1.5">
                        • {seg.process?.name}
                        <button onClick={() => startEditSegment(seg)} className="opacity-0 group-hover:opacity-100 group-hover/seg:opacity-100 text-gray-400 hover:text-white transition-opacity">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </span>
                      <span>
                        {seg.quantity} шт за {fmtHM(segWallMs)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {shifts.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">История пуста.</p>
        )}
      </div>
    </div>
  );
};
