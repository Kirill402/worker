import { apiClient } from '../../../shared/api/client';
import { LoginInput, Session, RegisterInput } from 'shared';

export const loginApi = async (data: LoginInput): Promise<Session> => {
  return apiClient<Session>('/auth/login', { data });
};

export const registerApi = async (data: RegisterInput): Promise<Session> => {
  return apiClient<Session>('/auth/register', { data });
};
