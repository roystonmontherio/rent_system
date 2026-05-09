import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { Building2, ArrowRight, Home, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      
      const role = response.data.user.role;
      if (role === 'owner') {
        navigate('/owner');
      } else if (role === 'broker') {
        navigate('/broker');
      } else {
        navigate('/explore');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Subtle Background Patterns for the left side / mobile */}
      <div className="absolute inset-0 z-0 lg:w-1/2 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 left-[-10%] z-0 h-[500px] w-[500px] rounded-full bg-[#09b4d6] opacity-[0.08] blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[20%] z-0 h-[400px] w-[400px] rounded-full bg-purple-600 opacity-[0.06] blur-[80px]"></div>

      {/* Left Column: Form */}
      <div className="relative z-10 flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24">
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-gray-200/60 dark:border-gray-800/60">
          <div>
            <div className="flex items-center gap-2 font-bold text-2xl text-[#09b4d6] mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#09b4d6] to-cyan-600 flex items-center justify-center text-white shadow-lg">
                <Building2 className="h-6 w-6" />
              </div>
              RentSystem
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please enter your details to sign in.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-900/50">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email address</Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-4 py-3 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <a href="#" className="text-sm font-medium text-[#09b4d6] hover:text-cyan-700">
                    Forgot password?
                  </a>
                </div>
                <div className="mt-1">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-4 py-3 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex w-full justify-center rounded-xl bg-[#09b4d6] py-6 px-4 text-sm font-semibold text-white shadow-lg hover:bg-[#08a2c2] hover:shadow-cyan-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09b4d6] transition-all group"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#09b4d6] hover:text-cyan-700 transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Showcase */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 h-full w-full object-cover bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#09b4d6] rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20"></div>
        
        <div className="relative h-full flex flex-col justify-between p-12 lg:p-24">
          <div></div> {/* Spacer */}
          
          <div className="space-y-6 text-white max-w-xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Manage your properties with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#09b4d6]">absolute clarity.</span>
            </h1>
            <p className="text-lg text-gray-300">
              The premier directory and management platform for property owners, trusted brokers, and discerning tenants.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-8 mt-8 border-t border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-800/80 backdrop-blur">
                  <Home className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-sm font-medium">Smart Portfolio</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-800/80 backdrop-blur">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm font-medium">Verified Brokers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
