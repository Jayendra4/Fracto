import { Outlet } from 'react-router-dom';
import type { JSX } from 'react';

export default function DashboardLayout(): JSX.Element {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)]  ">
      <Outlet />
    </div>
  );
}
