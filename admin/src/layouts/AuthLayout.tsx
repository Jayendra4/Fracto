import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@/hooks/redux';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';

export function AuthLayout() {
  const isAuthenticated = useIsAuthenticated();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Auth forms */}
      <div className="flex w-full lg:w-1/2 xl:w-1/3 flex-col justify-center px-6 sm:px-10 lg:px-20 relative">
        {/* Theme switcher */}
        {/* <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div> */}

        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
          </div>

          {/* Auth pages */}
          <Outlet />
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 items-center justify-center bg-muted">
        <img
          src="/images/home.png"
          alt="Auth illustration"
          className="max-h-[90vh] w-auto object-contain"
        />
      </div>
    </div>
  );
}
