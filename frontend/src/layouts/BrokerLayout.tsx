import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Building, Calendar, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/broker', icon: LayoutDashboard },
  { name: 'Assigned Properties', href: '/broker/properties', icon: Building },
  { name: 'Calendar & Approvals', href: '/broker/calendar', icon: Calendar },
  { name: 'Inbox', href: '/broker/inbox', icon: MessageSquare },
];

export default function BrokerLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== 'broker') {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
        {/* Subtle Background Patterns */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 z-0 h-[600px] w-[600px] rounded-full bg-purple-600 opacity-[0.06] blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-[-10%] z-0 h-[500px] w-[500px] rounded-full bg-pink-600 opacity-[0.04] blur-[100px] pointer-events-none"></div>

        <Sidebar className="border-r border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <SidebarHeader className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center gap-2 font-bold text-xl text-purple-600">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow">
                <Building className="h-4 w-4" />
              </div>
              Broker Portal
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4 flex flex-col justify-between h-full">
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-500 dark:text-gray-400">Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href || (item.href !== '/broker' && location.pathname.startsWith(item.href));
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton 
                          isActive={isActive} 
                          className={`w-full justify-start rounded-xl mb-1 transition-all ${isActive ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}`}
                          render={({ className }) => (
                            <Link to={item.href} className={className}>
                              <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                              {item.name}
                            </Link>
                          )}
                        />
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="mt-auto border-t border-gray-200/50 dark:border-gray-800/50 pt-4">
              <div className="flex items-center gap-3 px-3 py-2 mb-4 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800/50 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl px-4 sm:gap-x-6 sm:px-6 lg:px-8 shadow-sm">
            <SidebarTrigger className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" />
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1 items-center">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {navigation.find(n => n.href === location.pathname)?.name || 'Portal'}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
