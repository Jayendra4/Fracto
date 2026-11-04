import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
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

// import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { ROUTES } from '@/constants';
// import { useSelector } from 'react-redux';
// import type { RootState } from '@/redux/store';

// export default function AuthLayout() {
//   const { isAuthenticated } = useSelector(
//     (state: RootState) => state.authLogin
//   );
//   const location = useLocation();

//   const isAuthRoute =
//     location.pathname === ROUTES.LOGIN ||
//     location.pathname === ROUTES.SIGNUP ||
//     location.pathname === ROUTES.FORGOT_PASSWORD;

//   if (isAuthenticated && isAuthRoute) {
//     return <Navigate to={ROUTES.LANDING} replace />;
//   }

//   return <Outlet />;
// }
