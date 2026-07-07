import { apiClient } from '../../../shared/api/client';
import { SettingsInput, Setting } from 'shared';

export const getSettingsApi = async (): Promise<Setting> => {
  return apiClient<Setting>('/settings');
};

export const updateSettingsApi = async (data: SettingsInput): Promise<Setting> => {
  return apiClient<Setting>('/settings', {
    method: 'PUT',
    data,
  });
};
