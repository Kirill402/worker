import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { loginSchema } from 'shared';
import { ZodError } from 'zod';

interface LoginFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  serverError?: string | null;
  onToggleForm: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  serverError,
  onToggleForm,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const valid = loginSchema.parse({ email, password });
      onSubmit(valid);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((validationError) => {
          const path = validationError.path[0] as 'email' | 'password';
          fieldErrors[path] = validationError.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg">
          {serverError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="name@example.com"
        disabled={isLoading}
      />

      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        disabled={isLoading}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Войти
      </Button>

      <p className="text-center text-sm text-gray-400">
        Нет аккаунта?{' '}
        <button
          type="button"
          onClick={onToggleForm}
          className="text-primary-400 hover:text-primary-300 font-medium"
        >
          Зарегистрироваться
        </button>
      </p>
    </form>
  );
};
