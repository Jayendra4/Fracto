import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { DASHBOARD_ROUTE_ACCESS } from '@/config/dashboardRouteAccess';
import type { JSX } from 'react';

export default function DashboardRouteGuard({
  children,
}: {
  children: JSX.Element;
}) {
  const { pathname } = useLocation();
  const { role, isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  const roleKey = role.toLowerCase() as keyof typeof DASHBOARD_ROUTE_ACCESS;
  const allowedRoutes = DASHBOARD_ROUTE_ACCESS[roleKey];

  if (!allowedRoutes) {
    return <Navigate to="/dashboard" replace />;
  }

  const isAllowed = allowedRoutes.some((route) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  if (!isAllowed) {
    console.warn(`[DashboardRouteGuard] Route blocked for role "${role}": ${pathname}`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
