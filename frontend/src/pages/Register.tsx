import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { MailCheck, User, KeyRound, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const { register: registerUser, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#181A20] to-[#23272F] font-sans px-2">
      <motion.div
        className="w-full max-w-md mx-auto bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 flex flex-col gap-8"
        initial={{ opacity: 0, y: 56 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        tabIndex={-1}
        aria-label="Register form container"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)' }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-2 select-none tracking-tight">
          Create an account
        </h2>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} autoComplete="on" aria-label="Register form">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-base font-semibold text-gray-200 mb-2">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400 pointer-events-none transition-colors duration-200" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#20222b]/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder-gray-400 shadow-inner hover:shadow-lg focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] ${errors.name ? 'border-red-500 ring-red-400' : ''}`}
                placeholder="Enter your full name"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-red-400 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-200 mb-2">
              Email address
            </label>
            <div className="relative">
              <MailCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400 pointer-events-none transition-colors duration-200" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#20222b]/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder-gray-400 shadow-inner hover:shadow-lg focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] ${errors.email ? 'border-red-500 ring-red-400' : ''}`}
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-gray-200 mb-2">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400 pointer-events-none transition-colors duration-200" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`w-full pl-11 pr-11 py-2.5 rounded-xl bg-[#20222b]/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder-gray-400 shadow-inner hover:shadow-lg focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] ${errors.password ? 'border-red-500 ring-red-400' : ''}`}
                placeholder="Create a password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-200 focus:outline-none transition-colors duration-200"
                tabIndex={0}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-base font-semibold text-gray-200 mb-2">
              Confirm password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400 pointer-events-none transition-colors duration-200" />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                className={`w-full pl-11 pr-11 py-2.5 rounded-xl bg-[#20222b]/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder-gray-400 shadow-inner hover:shadow-lg focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] ${errors.confirmPassword ? 'border-red-500 ring-red-400' : ''}`}
                placeholder="Re-enter your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === watch('password') || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-200 focus:outline-none transition-colors duration-200"
                tabIndex={0}
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1 text-xs text-red-400 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#23272F] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base mt-2"
            disabled={loading}
            aria-busy={loading}
            style={{ boxShadow: '0 4px 24px 0 rgba(99,102,241,0.10), 0 1.5px 4px 0 rgba(99,102,241,0.10)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>
        <div className="text-center text-sm text-gray-300 mt-2">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-300 hover:text-indigo-200 hover:underline focus:outline-none focus:underline font-semibold transition-colors duration-200"
            tabIndex={0}
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;