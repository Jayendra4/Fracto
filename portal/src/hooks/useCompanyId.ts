import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useMemo } from 'react';
import { useLocalUser } from '@/hooks/useLocalUser';

export function useCompanyId(): number | null {
  const reduxCompanyId = useSelector((state: RootState) => state.kyb.companyId);

  const user = useLocalUser();

  const companyId = useMemo(() => {
    if (reduxCompanyId) return Number(reduxCompanyId);
    if ((user as any)?.kybId) {
      return Number((user as any).kybId);
    }
    if ((user as any)?.companyId) {
      return Number((user as any).companyId);
    }
    const docCompanyId = user?.entityDocument?.find(
      (d: any) => d?.companyId
    )?.companyId;

    if (docCompanyId) return Number(docCompanyId);
    const stored = localStorage.getItem('hof_company');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed?.id || parsed?._id || null;
      } catch {
        console.warn('Invalid hof_company JSON');
      }
    }

    return null;
  }, [reduxCompanyId, user]);

  return companyId;
}
