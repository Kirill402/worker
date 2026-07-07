import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loginApi, registerApi } from '../api/login';
import { LoginInput, RegisterInput, Session, User } from 'shared';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('worker_user');
    return saved ? JSON.parse(saved) : null;
  });

  const saveSession = (data: Session) => {
    localStorage.setItem('worker_token', data.token);
    localStorage.setItem('worker_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const loginMutation = useMutation<Session, Error, LoginInput>({
    mutationFn: loginApi,
    onSuccess: saveSession,
  });

  const registerMutation = useMutation<Session, Error, RegisterInput>({
    mutationFn: registerApi,
    onSuccess: saveSession,
  });

  const logout = () => {
    localStorage.removeItem('worker_token');
    localStorage.removeItem('worker_user');
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  };
};
