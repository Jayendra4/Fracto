import type { JSX } from 'react';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function AuthLayout(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthRoute =
    location.pathname === ROUTES.LOGIN ||
    location.pathname === ROUTES.SIGNUP ||
    location.pathname === ROUTES.FORGOT_PASSWORD;

  if (isAuthenticated && isAuthRoute) {
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  return <Outlet />;
}
