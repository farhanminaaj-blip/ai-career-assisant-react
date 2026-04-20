import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const githubRegex = /^[A-Za-z0-9-]+$/;

const checkStrength = (pass) => {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
};

const StrengthColors = {
  0: { label: 'too short', color: 'text-[#e24b4a]' },
  1: { label: 'weak', color: 'text-[#e24b4a]' },
  2: { label: 'fair', color: 'text-[#ef9f27]' },
  3: { label: 'strong', color: 'text-[#00a3ff]' },
  4: { label: 'very strong', color: 'text-[#00c878]' },
};

const InputWrapper = ({
  label,
  name,
  value,
  placeholder,
  type = 'text',
  showIcon = null,
  onChange,
  onBlur,
  error,
  success,
  onIconClick,
}) => {
  const borderClass = error
    ? 'border-[#e24b4a] ring-[rgba(226,75,74,0.15)]'
    : success
    ? 'border-[#00c878]'
    : 'border-[rgba(0,163,255,0.15)]';

  return (
    <div>
      <label className="block text-[11px] tracking-[0.4px] font-mono uppercase text-[#4a5a72] mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          value={value}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full h-10 rounded-lg bg-[#111827] text-[13px] font-mono text-[#e8edf5] placeholder-[#4a5a72] px-3 focus:outline-none transition-all duration-150 ${borderClass} focus:border-[#00a3ff] focus:ring-2 focus:ring-[rgba(0,163,255,0.10)]`}
          autoComplete="off"
        />
        {showIcon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8a9bb5] hover:text-[#00a3ff]"
          >
            {showIcon}
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-[11px] font-mono text-[#e24b4a]">{error}</p>
      ) : success ? (
        <p className="mt-1 text-[11px] font-mono text-[#00c878]">{success}</p>
      ) : null}
    </div>
  );
};

const CheckmarkIcon = () => (
  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 5L4.5 8.5L11 1" stroke="#00c878" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {open ? (
      <><path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z" stroke="#a0b7d6" strokeWidth="1.6"/>
      <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="#a0b7d6" strokeWidth="1.6"/></>
    ) : (
      <><path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z" stroke="#a0b7d6" strokeWidth="1.6"/>
      <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="#a0b7d6" strokeWidth="1.6"/>
      <path d="M2.5 2.5L21.5 21.5" stroke="#a0b7d6" strokeWidth="1.6"/></>
    )}
  </svg>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    githubUsername: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return 'Required';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Required';
        if (!emailRegex.test(value.trim())) return 'Invalid email address';
        return '';
      case 'githubUsername':
        if (!value.trim()) return 'Required';
        if (value.includes(' ')) return 'No spaces allowed';
        if (!githubRegex.test(value)) return 'Only letters, numbers and hyphens';
        return '';
      case 'password':
        if (!value) return 'Required';
        if (value.length < 8) return 'Minimum 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Required';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(checkStrength(value));
      if (touched.confirmPassword) {
        const confirmError = validateField('confirmPassword', formData.confirmPassword);
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    }

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === 'password') {
      setPasswordStrength(checkStrength(value));
    }
  };

  const getStrengthBars = () => {
    return [0, 1, 2, 3].map((index) => {
      const filled = passwordStrength > index;
      let bg = 'bg-[#1f2a42]';
      if (filled) {
        if (passwordStrength === 1) bg = 'bg-[#e24b4a]';
        if (passwordStrength === 2) bg = 'bg-[#ef9f27]';
        if (passwordStrength === 3) bg = 'bg-[#00a3ff]';
        if (passwordStrength === 4) bg = 'bg-[#00c878]';
      }
      return <div key={index} className={`h-[3px] rounded-full flex-1 ${bg}`} />;
    });
  };

  const touchAll = () => {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      githubUsername: true,
      password: true,
      confirmPassword: true,
    });
  };

  const validateAll = () => {
    const nextErrors = {
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      email: validateField('email', formData.email),
      githubUsername: validateField('githubUsername', formData.githubUsername),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((err) => !err);
  };

  const focusFirstError = () => {
    const fieldOrder = ['firstName', 'lastName', 'email', 'githubUsername', 'password', 'confirmPassword'];
    for (const field of fieldOrder) {
      if (errors[field]) {
        const el = document.querySelector(`[name='${field}']`);
        if (el) el.focus();
        break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    touchAll();

    if (!validateAll()) {
      focusFirstError();
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.success) {
        // Login the user with the response token
        login({
          token: response.token,
          refreshToken: response.refreshToken,
          user: response.user,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fieldSuccess = (field) => touched[field] && !errors[field] && formData[field];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        backgroundColor: '#0a0e1a',
        backgroundImage:
          'linear-gradient(rgba(0,163,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,163,255,0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-[rgba(0,163,255,0.15)] bg-[#0d1220] p-8 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00a3ff]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

        <div className="mt-6">
          <h2 className="text-[19px] font-medium text-[#e8edf5]">Create your account</h2>
          <p className="mt-2 text-[13px] text-[#8a9bb5] leading-6">
            Start generating AI-powered posts from your GitHub in minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {serverError && (
            <div className="rounded-lg border border-[#e24b4a] bg-[rgba(226,75,74,0.10)] px-4 py-3 text-sm text-[#e24b4a]">
              {serverError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputWrapper
              label="FIRST NAME"
              name="firstName"
              value={formData.firstName}
              placeholder="Rahul"
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.firstName && errors.firstName}
              success={fieldSuccess('firstName') ? 'Looks good' : ''}
            />
            <InputWrapper
              label="LAST NAME"
              name="lastName"
              value={formData.lastName}
              placeholder="Kumar"
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lastName && errors.lastName}
              success={fieldSuccess('lastName') ? 'Looks good' : ''}
            />
          </div>

          <InputWrapper
            label="EMAIL ADDRESS"
            name="email"
            value={formData.email}
            placeholder="dev@example.com"
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            success={fieldSuccess('email') ? 'Valid email' : ''}
          />

          <InputWrapper
            label="GITHUB USERNAME"
            name="githubUsername"
            value={formData.githubUsername}
            placeholder="rahul-dev"
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.githubUsername && errors.githubUsername}
            success={fieldSuccess('githubUsername') ? 'Looks good' : ''}
          />

          <InputWrapper
            label="PASSWORD"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            placeholder="Min. 8 characters"
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors.password}
            success={fieldSuccess('password') ? 'Strong enough' : ''}
            showIcon={<EyeIcon open={showPassword} />}
            onIconClick={() => setShowPassword((prev) => !prev)}
          />

          <div className="space-y-2">
            <div className="flex gap-1 h-[3px] mt-1 overflow-hidden">
              {getStrengthBars()}
            </div>
            <p className={`text-[11px] font-mono ${StrengthColors[passwordStrength].color}`}>
              {StrengthColors[passwordStrength].label}
            </p>
          </div>

          <InputWrapper
            label="CONFIRM PASSWORD"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            placeholder="Re-enter password"
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword && errors.confirmPassword}
            success={fieldSuccess('confirmPassword') ? 'Passwords match' : ''}
            showIcon={<EyeIcon open={showConfirmPassword} />}
            onIconClick={() => setShowConfirmPassword((prev) => !prev)}
          />

          <div className="rounded-lg border border-[rgba(0,163,255,0.15)] bg-[#111827] p-3">
            <p className="text-[11px] font-mono text-[#4a5a72] mb-2">This app will:</p>
            <div className="flex items-start gap-2 mb-1">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-[rgba(0,163,255,0.28)] bg-[rgba(0,163,255,0.12)]">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#00a3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-[12px] text-[#8a9bb5] leading-5">Access your public GitHub repositories</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-[rgba(0,163,255,0.28)] bg-[rgba(0,163,255,0.12)]">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#00a3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-[12px] text-[#8a9bb5] leading-5">Generate AI posts via NVIDIA NIM endpoint</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg bg-[#00a3ff] text-white font-mono text-[13px] font-medium transition-all duration-150 hover:bg-[#0078d4] active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create account →'}
          </button>

          <div className="text-center text-[13px] text-[#8a9bb5]">
            Already have an account?{' '}
            <button
              type="button"
              className="text-[#00a3ff] font-medium hover:underline"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};