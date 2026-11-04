import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, BellIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EnhancedSidebar } from '@/components/common/EnhancedSidebar';
import Loader from '@/components/common/Loader';
import { useCurrentAdmin } from '@/hooks/redux';
import { useGetAllNotificationsQuery } from '@/store/api/notificationApi';
import { useLazyGetAdminProfileQuery } from '@/store/api/adminApi';
import { setAdminProfile } from '@/store/slices/authSlice';
import { cn } from '@/utils';

export function DashboardLayout() {
  const adminDetail = useCurrentAdmin();
  const location = useLocation();
  const dispatch = useDispatch();
  const [fetchAdmin] = useLazyGetAdminProfileQuery();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  // Blocks the layout with a full-page loader only until the first
  // permission check settles, so the sidebar never renders with stale/no
  // permissions and then flickers once the real ones arrive.
  const [isCheckingPermissions, setIsCheckingPermissions] = React.useState(!adminDetail);
  const { data: notificationsData } = useGetAllNotificationsQuery({ skip: 0, take: 10 }, {
    pollingInterval: 60_000,
  });
  const hasUnread = notificationsData?.data?.some((n) => !n.viewed) ?? false;

  // Re-fetch the admin's profile (including permissions) on every page
  // navigation so role/permission changes apply without a full re-login.
  React.useEffect(() => {
    fetchAdmin()
      .unwrap()
      .then((admin) => dispatch(setAdminProfile(admin)))
      .catch(() => {})
      .finally(() => setIsCheckingPermissions(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const adminFullName = adminDetail ? adminDetail.firstname + ' ' + adminDetail.lastname : '';

  if (isCheckingPermissions) {
    return <Loader fullScreen size="lg" />;
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div
        className={cn(
          'flex flex-col h-screen overflow-hidden transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="flex flex-1 items-center space-x-4 px-6">
              {/* <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9" />
              </div> */}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* <ThemeSwitcher />

              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button> */}
              <Link to={'/notifications'} className="relative">
                <BellIcon className="h-5 w-5" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                )}
              </Link>

              <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative h-8 w-8 rounded-full overflow-hidden p-0">
                  {adminDetail?.profileImage ? (
                    <img
                      src={adminDetail?.profileImage || '/images/adminProfile.png'}
                      alt="Admin profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                      A
                    </div>
                  )}

                  <span className="sr-only">Admin menu</span>
                </div>

                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-none truncate max-w-[120px]">
                    {adminFullName?.trim() || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate max-w-[140px]">
                    {adminDetail?.email}
                  </p>
                </div>
              </Link>
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full overflow-hidden p-0"
                  >
                    {adminDetail?.profileImage ? (
                      <img
                        src={adminDetail?.profileImage || '/images/adminProfile.png'}
                        alt="Admin profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                        {adminDetail?.firstname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="sr-only">Admin menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {adminFullName?.trim() || 'Admin'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {adminDetail?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
