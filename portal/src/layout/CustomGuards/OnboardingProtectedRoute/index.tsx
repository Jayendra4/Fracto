import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ROUTES } from '@/constants';

export default function OnboardingProtectedRoute() {
  const location = useLocation();
  const path = location.pathname;

  const {
    isCompany,
    hasCompany,
    hasDirectors,
    nextStepRoute,
    rwaRequired,
    rwaOptional,
  } = useOnboarding();

  if (isCompany && path === ROUTES.USERKYC) {
    return <Navigate to={ROUTES.COMPLETEPROFILE} replace />;
  }

  if (!isCompany && path === ROUTES.DIRECTORKYC) {
    return <Navigate to={ROUTES.COMPLETEPROFILE} replace />;
  }

  if (path === ROUTES.COMPANYKYB && hasCompany) {
    return <Navigate to={ROUTES.COMPLETEPROFILE} replace />;
  }

  if (
    (path === ROUTES.DIRECTORKYC || path === ROUTES.USERKYC) &&
    hasDirectors
  ) {
    return <Navigate to={ROUTES.COMPLETEPROFILE} replace />;
  }

  if (path === ROUTES.RWA && !rwaRequired && !rwaOptional) {
    return <Navigate to={ROUTES.COMPLETEPROFILE} replace />;
  }

  if (
    nextStepRoute &&
    path !== nextStepRoute &&
    !(rwaOptional && path === ROUTES.RWA) &&
    !(rwaRequired && path === ROUTES.RWA)
  ) {
    return <Navigate to={ROUTES.COMPLETEPROFILE} replace />;
  }

  return <Outlet />;
}
