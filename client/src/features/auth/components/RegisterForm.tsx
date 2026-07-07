import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { registerSchema } from 'shared';
import { ZodError } from 'zod';

interface RegisterFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  serverError?: string | null;
  onToggleForm: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading,
  serverError,
  onToggleForm,
}) => {
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; name?: string; password?: string }>({});

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const valid = registerSchema.parse(formData);
      onSubmit(valid);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: { email?: string; name?: string; password?: string } = {};
        err.errors.forEach((validationError) => {
          const path = validationError.path[0] as keyof typeof formData;
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
        label="Имя"
        type="text"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={errors.name}
        placeholder="Иван"
        disabled={isLoading}
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={errors.email}
        placeholder="name@example.com"
        disabled={isLoading}
      />

      <Input
        label="Пароль"
        type="password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        error={errors.password}
        placeholder="Минимум 8 символов"
        disabled={isLoading}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Зарегистрироваться
      </Button>

      <p className="text-center text-sm text-gray-400">
        Уже есть аккаунт?{' '}
        <button
          type="button"
          onClick={onToggleForm}
          className="text-primary-400 hover:text-primary-300 font-medium"
        >
          Войти
        </button>
      </p>
    </form>
  );
};
