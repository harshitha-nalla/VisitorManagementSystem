import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginFormData {
  email: string;
  password: string;
}

const inputClassName = "mt-1 block w-full rounded-lg border border-primary-200 px-3 py-2 text-primary-900 placeholder-primary-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white hover:border-primary-300 transition-colors duration-200";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        formData
      );

      if (response.data.token) {
        localStorage.setItem('employeeToken', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        navigate('/pre-approval');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/30 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-elegant overflow-hidden border border-primary-100">
          <div className="p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-primary-100/50">
            <h2 className="text-2xl font-semibold text-primary-900">Employee Login</h2>
            <p className="mt-1 text-primary-600">Sign in to access the visitor pre-approval system</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-sm border border-primary-100 hover:border-primary-200 transition-colors duration-200">
              <label htmlFor="email" className="block text-sm font-medium text-primary-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Enter your work email"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-primary-100 hover:border-primary-200 transition-colors duration-200">
              <label htmlFor="password" className="block text-sm font-medium text-primary-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-primary-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium 
                ${isLoading 
                  ? 'bg-primary-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'} 
                transition-colors duration-200`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 