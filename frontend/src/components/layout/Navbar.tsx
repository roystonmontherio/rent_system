import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Home, Compass, User, LogOut, LayoutDashboard, MessageSquare, Menu, X, Star } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'owner') return '/owner';
    if (user.role === 'broker') return '/broker';
    return '/profile';
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="bg-gradient-to-tr from-[#09b4d6] to-cyan-400 text-white p-2 rounded-xl group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(9,180,214,0.5)] transition-all duration-300 shadow-md">
                <Home className="h-6 w-6" />
              </div>
              <span className="font-extrabold tracking-tight text-2xl text-gray-900 dark:text-white">
                RentSystem
              </span>
            </Link>
          </div>

          {/* Center Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/explore" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#09b4d6] transition-colors flex items-center gap-1.5">
              <Compass className="h-4 w-4" />
              Explore
            </Link>
            <a href="/#featured" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#09b4d6] transition-colors flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              Featured
            </a>
            <a href="/#how-it-works" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#09b4d6] transition-colors">
              How it Works
            </a>
          </div>

          {/* Right Actions (Desktop) */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated() ? (
                <>
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#09b4d6]">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/messages">
                    <Button variant="ghost" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#09b4d6]">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#09b4d6] to-cyan-400 flex items-center justify-center text-white font-bold shadow-sm">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-[#09b4d6]">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="font-semibold shadow-lg shadow-[#09b4d6]/20 bg-[#09b4d6] hover:bg-[#08a0bf] text-white rounded-xl">
                      <User className="h-4 w-4 mr-2" />
                      Login / Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-4">
          <Link to="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#09b4d6] flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Compass className="h-5 w-5 text-[#09b4d6]" /> Explore Properties
          </Link>
          <a href="/#featured" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#09b4d6] flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Star className="h-5 w-5 text-[#09b4d6]" /> Featured
          </a>
          <a href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#09b4d6] flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Home className="h-5 w-5 text-[#09b4d6]" /> How it Works
          </a>
          
          <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
          
          {isAuthenticated() ? (
            <>
              <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#09b4d6] flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <LayoutDashboard className="h-5 w-5 text-gray-500" /> Dashboard
              </Link>
              <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#09b4d6] flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <MessageSquare className="h-5 w-5 text-gray-500" /> Messages
              </Link>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-base font-semibold text-red-500 hover:text-red-600 flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left w-full">
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center h-12 text-base rounded-xl border-gray-300 dark:border-gray-700">Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full justify-center h-12 text-base bg-gradient-to-r from-cyan-500 to-[#09b4d6] hover:from-cyan-400 hover:to-[#08a0bf] text-white rounded-xl shadow-lg shadow-cyan-500/25">
                  Login / Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
