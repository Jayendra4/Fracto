import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedSidebar } from '@/components/common/EnhancedSidebar';
import { useCurrentAdmin } from '@/hooks/redux';
import { cn } from '@/utils';
import { useFcm } from '@/hooks/useFcm';
import { NotificationBell } from '@/components/common/NotificationBell';
import { useDispatch } from 'react-redux';
import { useGetAdminProfileQuery } from '@/store/api/adminApi';
import { setAdminProfile } from '@/store/slices/authSlice';

export function DashboardLayout() {
  useFcm();
  const dispatch = useDispatch();
  const { data: freshAdmin } = useGetAdminProfileQuery();
  const adminDetail = useCurrentAdmin();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (freshAdmin) {
      dispatch(setAdminProfile(freshAdmin));
    }
  }, [freshAdmin, dispatch]);
  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) return false;
      const saved = localStorage.getItem('sidebarState');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500';
      case 'Pending':
        return 'bg-yellow-400';
      case 'Draft':
        return 'bg-gray-400';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };
  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      localStorage.setItem('sidebarState', JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen]);

  const adminFullName = adminDetail?.firstname + ' ' + adminDetail?.lastname;

  return (
    <div className="min-h-screen bg-background">
      <EnhancedSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={cn('transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center h-16 px-4 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden hover:bg-primary/10"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex items-center flex-1 px-6 space-x-4"></div>

            <div className="flex items-center space-x-6">
              <NotificationBell />

              <Wallet
                className="w-5 h-5 cursor-pointer"
                onClick={() => navigate('/trustee-commission')}
              />
              <div 
                className="flex items-center gap-3 p-2 transition-all rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => navigate('/profile')}
              >
                {/* Avatar wrapper */}
                <div className="relative h-9 w-9 overflow-visible">
                  {/* Avatar */}
                  <div className="overflow-hidden rounded-full h-9 w-9 ring-2 ring-primary/30">
                    {adminDetail?.profileImage ? (
                      <img
                        src={adminDetail.profileImage}
                        alt="Admin profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-sm font-semibold text-white bg-gradient-primary">
                        {adminDetail?.firstname?.charAt(0)?.toUpperCase() ?? 'U'}
                      </div>
                    )}
                  </div>

                  {/* OUTER STATUS DOT */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background ${getStatusColor(
                      adminDetail?.kycStatus
                    )}`}
                  />
                </div>

                {/* Text */}
                <div className="hidden md:flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-none truncate max-w-[120px]">
                    {adminFullName?.trim() || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate max-w-[140px]">
                    {adminDetail?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 md:p-5 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
