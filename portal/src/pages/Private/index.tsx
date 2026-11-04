import { ROUTES } from '@/constants';
import type { JSX } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import Header from '@/layout/Header';

export default function PrivateRoutes(): JSX.Element {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );

  return isAuthenticated ? (
    <>
      <Header />
      <Outlet />
    </>
  ) : (
    <Navigate to={ROUTES.LOGIN} />
  );
}
