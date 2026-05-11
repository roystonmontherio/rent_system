import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { Building2, ArrowRight, UserCircle2, Briefcase, UserCheck, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'public_user',
    business_name: '',
    agency_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP Verification State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const setRole = (role: string) => {
    setFormData({ ...formData, role });
  };



  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      const phoneNumber = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
      await api.post('/auth/send-otp', { phone: phoneNumber });
      setOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const phoneNumber = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
      await api.post('/auth/verify-otp', { phone: phoneNumber, otp });
      setPhoneVerified(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneVerified) {
      setError('Please verify your phone number first.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const phoneNumber = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
      const payload = {
        ...formData,
        phone: phoneNumber
      };
      const response = await api.post('/auth/register', payload);
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
      setError(err.response?.data?.error || 'Failed to register account.');
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
      <div className="relative z-10 flex flex-col justify-center flex-1 px-4 py-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24">
        <div className="w-full max-w-lg mx-auto lg:w-[450px] animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-gray-200/60 dark:border-gray-800/60">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-[#09b4d6] mb-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#09b4d6] to-cyan-600 flex items-center justify-center text-white shadow-lg">
                <Building2 className="h-4 w-4" />
              </div>
              RentSystem
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Create an account
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Join us to discover or manage amazing properties.
            </p>
          </div>

          <div className="mt-4">

            <form onSubmit={handleRegister} className="space-y-3">
              {error && (
                <div className="p-3 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-900/50">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="first_name" className="text-sm text-gray-700 dark:text-gray-300">First Name</Label>
                  <Input 
                    id="first_name" 
                    value={formData.first_name} 
                    onChange={handleChange} 
                    required 
                    className="block w-full px-3 py-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="last_name" className="text-sm text-gray-700 dark:text-gray-300">Last Name</Label>
                  <Input 
                    id="last_name" 
                    value={formData.last_name} 
                    onChange={handleChange} 
                    required 
                    className="block w-full px-3 py-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-300">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="block w-full px-3 py-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-300">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    className="block w-full px-3 py-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Phone Verification Section */}
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className={`w-4 h-4 ${phoneVerified ? 'text-green-500' : 'text-[#09b4d6]'}`} />
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Phone Verification
                  </Label>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs text-gray-700 dark:text-gray-300">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+1234567890"
                        value={formData.phone} 
                        onChange={handleChange} 
                        disabled={phoneVerified || otpSent}
                        required
                        className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                      />
                      {!phoneVerified && (
                        <Button 
                          type="button" 
                          onClick={handleSendOtp} 
                          disabled={loading || otpSent || !formData.phone}
                          className="px-4 text-sm rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                        >
                          {otpSent ? 'Sent' : 'Send OTP'}
                        </Button>
                      )}
                    </div>
                    {!phoneVerified && !otpSent && (
                       <p className="text-[10px] text-gray-500 mt-0.5">Required format: + (country code) (number)</p>
                    )}
                  </div>

                  {otpSent && !phoneVerified && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="otp" className="text-xs text-gray-700 dark:text-gray-300">Enter OTP</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="otp" 
                          type="text" 
                          placeholder="123456"
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value)} 
                          className="block w-full px-3 py-2 text-sm tracking-widest text-center border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                        />
                        <Button 
                          type="button" 
                          onClick={handleVerifyOtp} 
                          disabled={loading || !otp}
                          className="px-4 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700"
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}

                  {phoneVerified && (
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-900/50 flex items-center justify-center">
                      Phone verified successfully!
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-gray-700 dark:text-gray-300">I am a...</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('public_user')}
                    className={`flex flex-col items-center justify-center py-2 px-1 border rounded-xl transition-all ${
                      formData.role === 'public_user' 
                        ? 'border-[#09b4d6] bg-[#09b4d6]/5 text-[#09b4d6]' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm'
                    }`}
                  >
                    <UserCircle2 className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">Guest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`flex flex-col items-center justify-center py-2 px-1 border rounded-xl transition-all ${
                      formData.role === 'owner' 
                        ? 'border-[#09b4d6] bg-[#09b4d6]/5 text-[#09b4d6]' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">Owner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('broker')}
                    className={`flex flex-col items-center justify-center py-2 px-1 border rounded-xl transition-all ${
                      formData.role === 'broker' 
                        ? 'border-[#09b4d6] bg-[#09b4d6]/5 text-[#09b4d6]' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">Broker</span>
                  </button>
                </div>
              </div>

              {formData.role === 'owner' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="business_name" className="text-xs text-gray-700 dark:text-gray-300">Business Name (Optional)</Label>
                  <Input 
                    id="business_name" 
                    value={formData.business_name} 
                    onChange={handleChange} 
                    className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                  />
                </div>
              )}

              {formData.role === 'broker' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="agency_name" className="text-xs text-gray-700 dark:text-gray-300">Agency Name (Optional)</Label>
                  <Input 
                    id="agency_name" 
                    value={formData.agency_name} 
                    onChange={handleChange} 
                    className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#09b4d6] focus:border-[#09b4d6] transition-all bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
                  />
                </div>
              )}

              <div className="pt-1">
                <Button 
                  type="submit" 
                  disabled={loading || !phoneVerified}
                  className="flex w-full justify-center rounded-xl bg-[#09b4d6] py-4 px-4 text-sm font-semibold text-white shadow-lg hover:bg-[#08a2c2] hover:shadow-cyan-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09b4d6] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#09b4d6] hover:text-cyan-700 transition-colors">
                Sign in here
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
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#09b4d6] rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20"></div>
        
        <div className="relative h-full flex flex-col justify-between p-12 lg:p-24">
          <div className="flex justify-end">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
               <Briefcase className="w-4 h-4 text-cyan-400" />
               Join thousands of professionals
             </div>
          </div>
          
          <div className="space-y-6 text-white max-w-xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Unlock the full potential of your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#09b4d6]">property network.</span>
            </h1>
            <p className="text-lg text-gray-300">
              Create an account today to streamline operations, connect with top agents, and reach more tenants than ever before.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
