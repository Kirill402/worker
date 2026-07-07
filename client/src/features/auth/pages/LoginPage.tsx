import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { Shield } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (data: any) => void;
  onRegisterSuccess: (data: any) => void;
  isLoading: boolean;
  serverError?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
  isLoading,
  serverError,
}) => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-accent-cyan/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-950/40 border border-primary-800/20 text-primary-400 mb-4 shadow-inner">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Табель смен
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Учёт рабочих сменов, выработки и расчёт зарплаты
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-glass border border-white/5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          {isRegister ? (
            <RegisterForm
              onSubmit={onRegisterSuccess}
              isLoading={isLoading}
              serverError={serverError}
              onToggleForm={() => setIsRegister(false)}
            />
          ) : (
            <LoginForm
              onSubmit={onLoginSuccess}
              isLoading={isLoading}
              serverError={serverError}
              onToggleForm={() => setIsRegister(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
