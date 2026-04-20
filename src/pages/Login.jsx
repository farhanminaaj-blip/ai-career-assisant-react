import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    const nextErrors = { email: '', password: '' };
    const emailValue = email.trim();
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!emailValue) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(emailValue)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const data = await loginUser({ email, password });
      login(data);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ email: '', password: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 py-8 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,163,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,163,255,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.4,
        }}
      />

      <div className="relative w-full max-w-sm rounded-[24px] border border-[rgba(0,163,255,0.15)] bg-[#0d1220] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00a3ff]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="18" r="2" fill="#0d1220" />
                <circle cx="18" cy="18" r="2" fill="#0d1220" />
                <circle cx="12" cy="6" r="2" fill="#0d1220" />
                <path d="M12 8L12 16" stroke="#0d1220" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6.8 16.4L11.2 7.6" stroke="#0d1220" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M17.2 16.4L12.8 7.6" stroke="#0d1220" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-medium text-[#e8edf5]">AI Career Assistant</p>
              <p className="mt-1 text-[11px] font-mono text-[#4a5a72]">github × nvidia ai</p>
            </div>
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(0,163,255,0.28)] bg-[rgba(0,163,255,0.12)] px-3 py-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#00a3ff]" />
          <span className="text-[11px] font-mono text-[#00a3ff]">system online · v1.0</span>
        </div>

        <div className="mt-8 space-y-3">
          <h2 className="text-[19px] font-medium text-[#e8edf5]">Welcome back</h2>
          <p className="text-[13px] text-[#8a9bb5]">Sign in to turn your GitHub commits into LinkedIn-ready posts.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <div className="mb-2 text-[11px] font-mono tracking-[0.4px] uppercase text-[#4a5a72]">
              EMAIL ADDRESS
            </div>
            <input
              className="w-full h-10 rounded-lg border border-[rgba(0,163,255,0.15)] bg-[#111827] px-3 text-[13px] font-mono text-[#e8edf5] placeholder-[#4a5a72] outline-none transition focus:border-[#00a3ff] focus:ring-2 focus:ring-[rgba(0,163,255,0.10)]"
              type="email"
              placeholder="dev@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
            />
            {errors.email && <p className="mt-2 text-[12px] text-[#ff5a5f]">{errors.email}</p>}
          </div>

          <div>
            <div className="mb-2 text-[11px] font-mono tracking-[0.4px] uppercase text-[#4a5a72]">
              PASSWORD
            </div>
            <div className="relative">
              <input
                className="w-full h-10 rounded-lg border border-[rgba(0,163,255,0.15)] bg-[#111827] px-3 pr-10 text-[13px] font-mono text-[#e8edf5] placeholder-[#4a5a72] outline-none transition focus:border-[#00a3ff] focus:ring-2 focus:ring-[rgba(0,163,255,0.10)]"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-2 inline-flex items-center text-[#8a9bb5]"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94L6.06 6.06" stroke="#8a9bb5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.88 9.88C9.53 10.19 9.28 10.6 9.15 11.05C9.02 11.5 9.02 11.99 9.15 12.44C9.28 12.89 9.53 13.31 9.88 13.62" stroke="#8a9bb5" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M14.12 14.12C14.47 13.81 14.72 13.4 14.85 12.95C14.98 12.5 14.98 12.01 14.85 11.56C14.72 11.11 14.47 10.69 14.12 10.38" stroke="#8a9bb5" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M4.93 4.93C7.07 3.19 9.59 2 12 2C18 2 22 8 22 8C21.16 9.26 20.05 10.33 18.75 11.18" stroke="#8a9bb5" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M9.88 9.88C10.69 9.32 11.8 9 13 9C15.76 9 18 11.24 18 14C18 14.68 17.86 15.32 17.6 15.9" stroke="#8a9bb5" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#8a9bb5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#8a9bb5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-2 text-[12px] text-[#ff5a5f]">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-[#00a3ff] text-[13px] font-mono font-medium text-white transition duration-200 hover:bg-[#0078d4] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/40 border-t-white" />
                Signing in...
              </span>
            ) : (
              'Sign in →'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-[11px] font-mono text-[#4a5a72]">
          <span className="h-px flex-1 bg-[rgba(0,163,255,0.15)]" />
          <span>or</span>
          <span className="h-px flex-1 bg-[rgba(0,163,255,0.15)]" />
        </div>

        <div className="text-center text-[13px] text-[#8a9bb5]">
          <span>No account? </span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-medium text-[#00a3ff] hover:underline"
          >
            Create one free
          </button>
        </div>
      </div>
    </div>
  );
}
