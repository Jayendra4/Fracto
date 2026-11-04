import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  UserCog,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Upload,
  CreditCard,
  IndentIcon,
  LogOut,
  LayoutDashboard,
  GitPullRequest,
  Wallet2,
  Building,
  Shield,
  Dot,
  Briefcase,
  Vote,
  Lock,
  Coins,
  Calendar,
  FolderLock,
  ArrowLeftRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/utils';
import { useCurrentAdmin, useUserRole } from '@/hooks/redux';
import { ACCOUNT_TYPES, KycStatus, UserRole } from '@/types';
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
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'SPV List', href: '/spv-list', icon: Building },
  { name: 'Asset List', href: '/asset-list', icon: Briefcase },
  { name: 'Shareholder Register', href: '/shareholder-register', icon: Users },
  // { name: 'Governance Votes', href: '/governance-votes', icon: Vote },
  // { name: 'Document Vault', href: '/document-vault', icon: FolderLock },
  {
    name: 'Secondary Transfer Requests',
    href: '/secondary-transfer-requests',
    icon: ArrowLeftRight,
  },
  { name: 'Exit / Liquidation Tracker', href: '/exit-liquidation-tracker', icon: TrendingUp },
  { name: 'Verifier Tracker', href: '/verifier-tracker', icon: UserCheck },
  { name: 'Reports', href: '/reports', icon: FileText },
  {
    name: 'User Management',
    icon: Users,
    children: [
      { name: 'Investors', href: `/users/${ACCOUNT_TYPES.INVESTOR}`, icon: Users },
      { name: 'Asset Owner', href: `/users/${ACCOUNT_TYPES.ASSETOWNER}`, icon: Users },
      { name: 'Company', href: `/users/${ACCOUNT_TYPES.COMPANY}`, icon: Users },
      { name: 'Broker', href: `/users/${ACCOUNT_TYPES.BROKER}`, icon: Users },
      // { name: 'Deposit Request', href: '/deposit-request', icon: FileText },
      // { name: 'Withdraw Request', href: '/withdraw-request', icon: Upload },
    ],
  },
  { name: 'Trustee KYC', href: '/trustee-kyc', icon: IndentIcon },
  { name: 'Trustee Commission', href: '/trustee-commission', icon: IndentIcon },
  {
    name: 'Profile & Settings',
    icon: UserCog,
    children: [
      { name: 'Profile ', href: '/profile', icon: UserCog },
      { name: 'Change Password', href: '/change-password', icon: Lock },
    ],
  },
];

interface NavItemComponentProps {
  item: NavItem;
  isOpen: boolean;
  level?: number;
  onToggle?: () => void;
}

function NavItemComponent({ item, isOpen, level = 0, onToggle }: NavItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const userRole = useUserRole();
  const adminDetail = useCurrentAdmin();

  const isAdmin = userRole === UserRole.ADMIN;

  // Don't render admin-only items for non-admin users
  if (item.adminOnly && !isAdmin) {
    return null;
  }

  const queryType = new URLSearchParams(location.search).get('type');

  const checkIsActive = (href?: string) => {
    if (!href) return false;
    if (location.pathname === href) return true;
    if (
      href === '/user-management' &&
      (location.pathname === '/user-management' || location.pathname.startsWith('/users/'))
    ) {
      return true;
    }
    return false;
  };
  const isKycDone =
    adminDetail?.kycStatus === KycStatus.Approved ||
    adminDetail?.kyc?.status === KycStatus.Approved;

  // if (item.href === '/trustee-kyc' && isKycDone) {
  //   return null;
  // }

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? checkIsActive(item.href) : false;
  const hasActiveChild = item.children?.some(
    (child) => child.href && (checkIsActive(child.href) || location.pathname.startsWith(child.href))
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

  const Icon = item.icon;
  const indent = level * 16;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={handleClick}
          className={cn(
            'group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive || hasActiveChild
              ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            !isOpen && 'justify-center'
          )}
          style={{ paddingLeft: isOpen ? `${12 + indent}px` : undefined }}
          title={!isOpen ? item.name : undefined}
        >
          <Icon
            className={cn('h-5 w-5 transition-transform group-hover:scale-110', isOpen && 'mr-3')}
          />
          {isOpen && (
            <>
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 ring-1 ring-primary/30 px-2 py-0.5 text-xs font-semibold text-primary">
                  {item.badge}
                </span>
              )}
              {isExpanded ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </>
          )}
        </button>

        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1 pl-2 border-l-2 border-primary/20 ml-6">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.name}
                item={child}
                isOpen={isOpen}
                level={level + 1}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href!}
      className={({ isActive: routerIsActive }) =>
        cn(
          'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          routerIsActive || isActive
            ? 'bg-primary/10 text-primary ring-1 ring-primary/30 shadow-lg shadow-primary/20'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-md',
          !isOpen && 'justify-center'
        )
      }
      style={{ paddingLeft: isOpen ? `${12 + indent}px` : undefined }}
      title={!isOpen ? item.name : undefined}
    >
      <Icon
        className={cn('h-5 w-5 transition-transform group-hover:scale-110', isOpen && 'mr-3')}
      />
      {isOpen && (
        <>
          <span>{item.name}</span>
          {item.badge && (
            <span className="ml-auto inline-flex items-center rounded-full bg-primary/20 ring-1 ring-primary/30 px-2 py-0.5 text-xs font-semibold text-primary">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function EnhancedSidebar({ isOpen, onToggle }: SidebarProps) {
  const adminDetail = useCurrentAdmin();
  const userRole = useUserRole();
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-card border-r transition-all duration-300 overflow-hidden',
          isOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <div className={cn('flex items-center', isOpen ? 'w-full' : 'justify-center')}>
            {!isOpen && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                <img src="/smallLogo.svg" alt="" />
              </div>
            )}

            {isOpen && (
              <div className="ml-3 flex-1">
                <img src="/logo.svg" alt="" />
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn('hidden lg:flex h-6 w-6', isOpen ? 'ml-auto' : 'fixed left-2 top-3 z-40')}
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto sidebar">
          {navigation
            .filter((item) => {
              const isKycDone =
                adminDetail?.kycStatus === KycStatus.Approved ||
                adminDetail?.kyc?.status === KycStatus.Approved;
              if (item.href === '/trustee-kyc' && isKycDone) {
                return false;
              }
              return true;
            })
            .map((item) => (
              <NavItemComponent key={item.name} item={item} isOpen={isOpen} onToggle={onToggle} />
            ))}
        </nav>

        {isOpen && adminDetail && (
          <div className="border-t p-4">
            <div className="flex items-center">
              {adminDetail?.profileImage ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <img
                    src={adminDetail?.profileImage}
                    alt="Admin profile"
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  A
                </div>
              )}

              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{adminDetail?.firstname}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userRole?.toLowerCase()} • {adminDetail?.email}
                </p>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <Button
                onClick={() => setShowLogoutConfirm(true)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        )}
        {!isOpen && adminDetail && (
          <div className="border-t p-2">
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                {adminDetail?.firstname.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-md border border-input p-6 bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2 text-xl font-bold">
                <LogOut className="h-5 w-5 text-destructive" />
                Confirm Logout
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Are you sure you want to log out of the Trustee portal? You will need to sign in again
            to access the dashboard.
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowLogoutConfirm(false);
                handleLogout();
              }}
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
