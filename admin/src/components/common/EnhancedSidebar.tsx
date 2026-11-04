import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Shield,
  Calendar,
  HelpCircle,
  LogOut,
  Building,
  Landmark,
  Tags,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { useCurrentAdmin, useHasPermission, useUserRole } from '@/hooks/redux';
import { UserRole } from '@/types';
import { useLogoutMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  permission?: string;
  badge?: string;
  children?: NavItem[];
  isHeader?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, permission: 'dashboard.view' },
  { name: 'Assets', isHeader: true },
  { name: 'Asset Review Queue', href: '/asset-review', icon: Building, permission: 'asset.view' },
  {
    name: 'Governance & Asset Mgmt',
    href: '/govt-asset-management',
    icon: Building,
    permission: 'asset.view',
  },
  { name: 'Investors', isHeader: true },
  {
    name: 'Secondary Marketplace',
    href: '/secondarymarket',
    icon: Landmark,
    permission: 'secondary_marketplace.view',
  },

  { name: 'Groups & Voting', isHeader: true },
  { name: 'Category', href: '/category', icon: Tags, permission: 'category.view' },
  { name: 'Primary Groups', href: '/primary-groups', icon: Users, permission: 'group.view' },
  {
    name: 'Secondary Groups',
    href: '/secondary-groups',
    icon: Users,
    permission: 'secondary_group.view',
  },
  { name: ' Consent', href: '/consent', icon: Users, permission: 'nda_consent.view' },
  // {
  //   name: 'Club & Vote Management',
  //   href: '/club-management',
  //   icon: Calendar,
  //   permission: 'vote.view',
  // },
  { name: 'Operations', isHeader: true },
  { name: 'User Management', href: '/user-management', icon: Users, permission: 'users.view' },
  { name: 'KYC Review', href: '/kyc', icon: Shield, permission: 'kyc.view' },
  { name: 'SPV Management', href: '/spv-managememt', icon: Building, permission: 'spv.view' },
  // { name: 'RM Assignment', href: '/rmassignment', icon: User },
  {
    name: 'Manual Payments',
    href: '/manual-payments',
    icon: CreditCard,
    permission: 'manual_payment.view',
  },
  {
    name: 'Deposit Request',
    href: '/deposit-request',
    icon: CreditCard,
    permission: 'deposit_request.view',
  },
  {
    name: 'Withdraw Request',
    href: '/withdraw-request',
    icon: CreditCard,
    permission: 'withdrawal_request.view',
  },
  // { name: 'Tickets', href: '/tickets', icon: Mail },
  { name: 'Platform', isHeader: true },
  { name: 'Status Legend', href: '/status-legend', icon: HelpCircle },
  {
    name: 'Compliance Reports',
    href: '/reports',
    icon: FileText,
    permission: 'compliance_report.view',
  },
  { name: 'Roles & Privileges', href: '/users/roles', icon: Shield, permission: 'roles.view' },
  { name: 'Profile & Settings', href: '/profile', icon: Settings, permission: 'system.view' },
];

interface NavItemComponentProps {
  item: NavItem;
  isOpen: boolean;
  level?: number;
}

function NavItemComponent({ item, isOpen, level = 0 }: NavItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const userRole = useUserRole();
  const adminDetail = useCurrentAdmin();

  const isAdmin = userRole === UserRole.ADMIN;
  const hasPermission = useHasPermission(item.permission ?? '');

  if (item.adminOnly && !isAdmin) {
    return null;
  }

  if (item.permission && !hasPermission) {
    return null;
  }

  if (item.isHeader) {
    if (!isOpen) return null;
    return (
      <div className="px-3 pt-4 pb-1 text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest mt-3 first:mt-0 border-t border-slate-800/10 first:border-t-0">
        {item.name}
      </div>
    );
  }

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href
    ? location.pathname === item.href ||
      (item.href === '/secondary-groups' && location.pathname.startsWith('/secondary-groups')) ||
      (item.href === '/primary-groups' &&
        (location.pathname === '/primary-groups' ||
          location.pathname.startsWith('/group/') ||
          location.pathname === '/create-group' ||
          location.pathname.startsWith('/edit-group/'))) ||
      (item.href === '/category' &&
        (location.pathname === '/category' || location.pathname === '/create-category'))
    : false;
  const hasActiveChild = item.children?.some(
    (child) => child.href && location.pathname.startsWith(child.href)
  );

  // Auto-expand if has active child
  React.useEffect(() => {
    if (hasActiveChild && isOpen) {
      setIsExpanded(true);
    }
  }, [hasActiveChild, isOpen]);

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const Icon = item.icon || HelpCircle;
  const indent = level * 16;

  if (hasChildren) {
    return (
      <div>
        <button
          aria-label="up-down"
          onClick={handleClick}
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive || hasActiveChild
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            !isOpen && 'justify-center'
          )}
          style={{ paddingLeft: isOpen ? `${12 + indent}px` : undefined }}
          title={!isOpen ? item.name : undefined}
        >
          <Icon className={cn('h-5 w-5', isOpen && 'mr-3')} />
          {isOpen && (
            <>
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium">
                  {item.badge}
                </span>
              )}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </>
          )}
        </button>

        {/* Submenu */}
        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItemComponent key={child.name} item={child} isOpen={isOpen} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular nav item
  return (
    <NavLink
      to={item.href!}
      className={({ isActive: navLinkActive }) =>
        cn(
          'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          navLinkActive || isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          !isOpen && 'justify-center'
        )
      }
      style={{ paddingLeft: isOpen ? `${12 + indent}px` : undefined }}
      title={!isOpen ? item.name : undefined}
    >
      <Icon className={cn('h-5 w-5', isOpen && 'mr-3')} />
      {isOpen && (
        <>
          <span>{item.name}</span>
          {item.badge && (
            <span className="ml-auto inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function isNavItemVisible(
  item: NavItem,
  permissions: string[] | undefined,
  isAdmin: boolean
): boolean {
  if (item.adminOnly && !isAdmin) return false;
  if (item.permission && permissions && !permissions.includes(item.permission)) return false;
  return true;
}

export function EnhancedSidebar({ isOpen, onToggle }: SidebarProps) {
  const adminDetail = useCurrentAdmin();
  const userRole = useUserRole();
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = userRole === UserRole.ADMIN;
  const visibleNavigation = navigation.filter((item, index) => {
    if (!item.isHeader) {
      return isNavItemVisible(item, adminDetail?.permissions, isAdmin);
    }
    for (let i = index + 1; i < navigation.length; i++) {
      const next = navigation[i];
      if (!next || next.isHeader) break;
      if (isNavItemVisible(next, adminDetail?.permissions, isAdmin)) return true;
    }
    return false;
  });

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      dispatch(clearAuth());
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {/* Sidebar backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-card border-r transition-all duration-300 overflow-hidden',
          isOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center h-16 px-4 border-b shrink-0">
          <div className={cn('flex items-center', isOpen ? 'w-full' : 'justify-center')}>
            <div className="flex items-center justify-center w-8 h-8 font-bold rounded-lg bg-primary text-primary-foreground">
              <img src="/smallLogo.svg" alt="" />
            </div>
            {isOpen && (
              <div className="flex-1 ml-3">
                <span className="text-lg font-semibold">Admin</span>
              </div>
            )}
          </div>

          {/* Toggle button - desktop only */}
          <Button
            aria-label="Left Right"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn('hidden lg:flex h-6 w-6', isOpen ? 'ml-auto' : 'fixed left-2 top-3 z-40')}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-2 space-y-1 overflow-y-auto sidebar">
          {visibleNavigation.map((item) => (
            <NavItemComponent key={item.name} item={item} isOpen={isOpen} />
          ))}
        </nav>

        {/* User info */}
        {isOpen && adminDetail && (
          <div
            className="p-4 border-t shrink-0"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center">
              {adminDetail?.profileImage ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                  <img
                    src={adminDetail?.profileImage}
                    alt="Admin profile"
                    className="object-cover w-full h-full rounded-full"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-8 h-8 text-sm rounded-full bg-primary text-primary-foreground">
                  {adminDetail?.firstname.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0 ml-3">
                <p className="text-sm font-medium truncate">{adminDetail?.firstname}</p>
                <p className="text-xs truncate text-muted-foreground">
                  {userRole?.toLowerCase()} • {adminDetail?.email}
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex mt-3 space-x-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                aria-label="Logout "
                size="sm"
                className="flex-1"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed user indicator */}
        {!isOpen && adminDetail && (
          <div
            className="p-2 border-t shrink-0"
            style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-8 h-8 text-sm rounded-full bg-primary text-primary-foreground">
                {adminDetail?.firstname.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
