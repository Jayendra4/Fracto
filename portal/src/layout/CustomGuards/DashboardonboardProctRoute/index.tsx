import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ROUTES } from '@/constants';

export default function DashboardonboardProctRoute() {
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

  const is = (route: string) => path.endsWith(route);

  if (isCompany && is(ROUTES.USERKYC)) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  if (!isCompany && is(ROUTES.DIRECTORKYC)) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  if (is(ROUTES.COMPANYKYB) && hasCompany) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  if ((is(ROUTES.DIRECTORKYC) || is(ROUTES.USERKYC)) && hasDirectors) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  if (is(ROUTES.RWA) && !rwaRequired && !rwaOptional) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  //   if (
  //     nextStepRoute &&
  //     path !== nextStepRoute &&
  //     !(rwaOptional && path === ROUTES.RWA) &&
  //     !(rwaRequired && path === ROUTES.RWA)
  //   ) {
  //     return <Navigate to={ROUTES. ONBOARDING} replace />;
  //   }

  const isOnboardingRoot = path.startsWith(ROUTES.ONBOARDING);

  if (
    nextStepRoute &&
    path !== nextStepRoute &&
    !isOnboardingRoot &&
    !(rwaOptional && path === ROUTES.RWA) &&
    !(rwaRequired && path === ROUTES.RWA)
  ) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return <Outlet />;
}
