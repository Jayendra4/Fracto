import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAuth = () => useAppSelector((state) => state.auth);
export const useFeatureFlags = () => useAppSelector((state) => state.featureFlags);
export const useUI = () => useAppSelector((state) => state.ui);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);
export const useCurrentAdmin = () => useAppSelector((state) => state.auth.admin);
export const useUserRole = () => useAppSelector((state) => state.auth.role);
export const useFeatureFlag = (flag: keyof import('@/types').FeatureFlags) => {
  return useAppSelector((state) => state.featureFlags.flags[flag]);
};
