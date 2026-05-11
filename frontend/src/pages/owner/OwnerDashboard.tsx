import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MessageCircle, ArrowRight, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import api from '@/services/api';

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProperties: 0,
    inboxRequests: 0,
    activeConversations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/users/stats');
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Here is what's happening with your property portfolio today.
        </p>
      </header>

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-gray-200/60 dark:border-gray-800/60 shadow-xl rounded-[2rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProperties}</div>
            <p className="text-xs text-green-500 font-medium flex items-center mt-1">
              Active listings in your portfolio
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200/60 dark:border-gray-800/60 shadow-xl rounded-[2rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Inbox Requests</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inboxRequests}</div>
            <p className="text-xs text-green-500 font-medium flex items-center mt-1">
              New chat requests waiting
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200/60 dark:border-gray-800/60 shadow-xl rounded-[2rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Conversations</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeConversations}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center mt-1">
              Ongoing chats with users
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mt-8 mb-4">Quick Actions</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {/* Properties Quick Link */}
        <Card className="border border-gray-200/60 dark:border-gray-800/60 shadow-lg rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-900/90 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Manage Listings</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">View, edit, or add new properties to your directory portfolio.</p>
            <Link to="/owner/properties">
              <Button variant="outline" size="sm" className="w-full justify-between rounded-xl bg-white/50 dark:bg-gray-950/50 hover:bg-white dark:hover:bg-gray-800 border-gray-200/50 dark:border-gray-700/50">
                Go to Properties <ArrowRight className="h-4 w-4 ml-2 text-gray-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Inbox Quick Link */}
        <Card className="border border-gray-200/60 dark:border-gray-800/60 shadow-lg rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-900/90 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Messages & Leads</CardTitle>
            <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Check your inbox for inquiries from potential renters and buyers.</p>
            <Link to="/owner/inbox">
              <Button variant="outline" size="sm" className="w-full justify-between rounded-xl bg-white/50 dark:bg-gray-950/50 hover:bg-white dark:hover:bg-gray-800 border-gray-200/50 dark:border-gray-700/50">
                Open Inbox <ArrowRight className="h-4 w-4 ml-2 text-gray-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
