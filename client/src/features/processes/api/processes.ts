import { apiClient } from '../../../shared/api/client';
import { ProcessInput, Process } from 'shared';

export const getProcessesApi = async (): Promise<Process[]> => {
  return apiClient<Process[]>('/processes');
};

export const createProcessApi = async (data: ProcessInput): Promise<Process> => {
  return apiClient<Process>('/processes', { data });
};

export const deleteProcessApi = async (id: string): Promise<void> => {
  return apiClient<void>(`/processes/${id}`, { method: 'DELETE' });
};
