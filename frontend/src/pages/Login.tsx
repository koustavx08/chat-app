import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { MailCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#15161c] via-[#181A20] to-[#23272F] font-sans px-2">
      <motion.div
        className="w-full max-w-md mx-auto bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 flex flex-col gap-8"
        initial={{ opacity: 0, y: 56 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        tabIndex={-1}
        aria-label="Login form container"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)' }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-2 select-none tracking-tight">
          Sign in to your account
        </h2>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} autoComplete="on" aria-label="Login form">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-200 mb-2">
              Email address
            </label>
            <div className="relative">
              <MailCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-400 pointer-events-none transition-colors duration-200" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#20222b]/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 placeholder-gray-400 shadow-inner hover:shadow-lg focus:shadow-[0_0_0_3px_rgba(45,212,191,0.15)] ${errors.email ? 'border-red-500 ring-red-400' : ''}`}
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
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-base font-semibold text-gray-200">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-teal-300 hover:text-teal-200 hover:underline focus:outline-none focus:underline font-medium transition-colors duration-200"
                tabIndex={0}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-400 pointer-events-none transition-colors duration-200" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`w-full pl-11 pr-11 py-2.5 rounded-xl bg-[#20222b]/80 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 placeholder-gray-400 shadow-inner hover:shadow-lg focus:shadow-[0_0_0_3px_rgba(45,212,191,0.15)] ${errors.password ? 'border-red-500 ring-red-400' : ''}`}
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-300 hover:text-teal-200 focus:outline-none transition-colors duration-200"
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

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 hover:from-teal-300 hover:via-indigo-400 hover:to-purple-400 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-[#23272F] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base mt-2"
            disabled={loading}
            aria-busy={loading}
            style={{ boxShadow: '0 4px 24px 0 rgba(45,212,191,0.10), 0 1.5px 4px 0 rgba(99,102,241,0.10)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <div className="text-center text-sm text-gray-300 mt-2">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-teal-300 hover:text-teal-200 hover:underline focus:outline-none focus:underline font-semibold transition-colors duration-200"
            tabIndex={0}
          >
            Create one
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;