import { ApiResponse } from 'shared';

const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export const apiClient = async <T>(
  endpoint: string,
  { data, headers, ...customConfig }: RequestOptions = {}
): Promise<T> => {
  const configHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((headers as Record<string, string>) || {}),
  };

  const token = localStorage.getItem('worker_token');
  if (token) {
    configHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    headers: configHeaders,
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const parsedData: ApiResponse<T> = await response.json();

    if (!response.ok || !parsedData.success) {
      throw new Error(parsedData.error?.message || 'Something went wrong');
    }

    return parsedData.data as T;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error instanceof Error ? error : new Error('Network error occurred');
  }
};
