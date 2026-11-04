import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentAdmin, useHasPermission } from '@/hooks/redux';

interface PermissionRouteProps {
  permission: string;
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const admin = useCurrentAdmin();
  const hasPermission = useHasPermission(permission);

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
