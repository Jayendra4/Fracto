import { Outlet, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@/hooks/redux';

export function AuthLayout() {
  const isAuthenticated = useIsAuthenticated();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#0B0C0E] text-white">
      <div className="hidden  relative flex-1 max-h-screen lg:flex items-center justify-center">
        <img src="/images/loginPage1.png" className="object-cover" alt="" />
        <div className="py-10 absolute top-12 left-12">
          <img src="/logo.svg" alt="" />
        </div>
      </div>
      <div className="flex-1 max-w-[640px] mx-auto w-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:pr-20 xl:pr-24">
        <div className="mx-auto w-full  ">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
