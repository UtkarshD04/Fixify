import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Userlogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const userContext = useContext(UserDataContext);
  const setUser = userContext?.setUser ?? (() => {});

  const loginHandler = async (e) => {
    e.preventDefault();
    setMessage('');

    const userData = { email, password };

    setEmail('');
    setPassword('');

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, '');
      const response = await axios.post(
        `${baseUrl}/users/login`,
        userData
      );

      if (response.status === 200) {
        const data = response.data;
        // Clear any provider data
        localStorage.removeItem('utilityData');
        
        // Check for saved profile data from previous session
        const tempUserProfile = localStorage.getItem('tempUserProfile');
        let finalUserData = data.user;
        
        if (tempUserProfile) {
          try {
            const savedProfile = JSON.parse(tempUserProfile);
            // Merge with saved profile data
            finalUserData = {
              ...data.user,
              fullname: savedProfile.fullname || data.user.fullname,
              profileImage: savedProfile.profileImage || data.user.profileImage,
              phone: savedProfile.phone || data.user.phone
            };
            // Clean up temp data
            localStorage.removeItem('tempUserProfile');
          } catch (e) {
            console.log('Error parsing temp user data');
          }
        }
        
        setUser(finalUserData);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(finalUserData));
        navigate('/portal');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        setMessage('Invalid email or password. Please try again.');
      } else if (error.response) {
        setMessage(`Login failed. Server responded with status ${error.response.status}.`);
      } else {
        setMessage('Login failed. Please check your network connection.');
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-200/30 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-emerald-200/30 rounded-full filter blur-3xl opacity-40 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 rounded-full filter blur-3xl opacity-30"></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 max-w-md w-full p-6 sm:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-gradient-to-br from-[#0047AB] to-[#10B981] rounded-2xl shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#0047AB] to-[#10B981] bg-clip-text text-transparent mb-2">Welcome Back!</h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to access your account</p>
        </div>

        {message && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-6 animate-fade-in-down">
            {message}
          </div>
        )}

        <form onSubmit={loginHandler} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/70 border border-blue-200/50 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent font-medium transition-all duration-300 text-sm sm:text-base shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 sm:py-4 bg-white/70 border border-blue-200/50 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent font-medium transition-all duration-300 text-sm sm:text-base shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0047AB] to-[#10B981] text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
          >
            Sign In
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#0047AB] font-semibold hover:text-[#10B981] transition-colors duration-300">
            Create one
          </Link>
        </p>

        {/* Google Login */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => alert('Google OAuth integration coming soon!')}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-500 font-medium">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <Link
          to="/utility-login"
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
        >
          Sign in as Service Provider
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
};

export default Userlogin;
