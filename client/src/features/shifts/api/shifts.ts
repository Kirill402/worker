import { apiClient } from '../../../shared/api/client';
import { Shift, ManualShiftInput } from 'shared';

export const getShiftsApi = async (): Promise<Shift[]> => {
  return apiClient<Shift[]>('/shifts');
};

export const startShiftApi = async (): Promise<any> => {
  return apiClient<any>('/shifts/start', { method: 'POST' });
};

export const startSegmentApi = async (data: { processId: string; quantity?: number }): Promise<any> => {
  return apiClient<any>('/shifts/segment/start', { method: 'POST', data });
};

export const endSegmentApi = async (data: { quantity: number }): Promise<any> => {
  return apiClient<any>('/shifts/segment/end', { method: 'POST', data });
};

export const closeShiftApi = async (data: { quantity: number }): Promise<any> => {
  return apiClient<any>('/shifts/close', { method: 'POST', data });
};

export const createManualShiftApi = async (data: ManualShiftInput): Promise<any> => {
  return apiClient<any>('/shifts/manual', { method: 'POST', data });
};

export const deleteShiftApi = async (id: string): Promise<any> => {
  return apiClient<any>(`/shifts/${id}`, { method: 'DELETE' });
};

export const updateShiftApi = async (id: string, data: { startTime?: string; endTime?: string }): Promise<any> => {
  return apiClient<any>(`/shifts/${id}`, { method: 'PUT', data });
};

export const updateShiftSegmentApi = async (segmentId: string, data: { quantity: number; processId?: string }): Promise<any> => {
  return apiClient<any>(`/shifts/segment/${segmentId}`, { method: 'PUT', data });
};
