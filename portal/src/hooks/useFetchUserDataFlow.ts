import { useDispatch } from 'react-redux';
import { setAuthData } from '@/redux/slices/authLoginSlice';
import { useProfile } from '@/api';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useFetchUserDataFlow() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  // const runningRef = useRef(false);
  // const lastTokenRef = useRef<string | null>(null);

  const emitUserUpdated = () => {
    window.dispatchEvent(new Event('hof:user-updated'));
  };

  const run = async (newToken: string, callback?: () => void) => {
    // if (runningRef.current && lastTokenRef.current === token) return;

    // runningRef.current = true;
    // lastTokenRef.current = token;
    setToken(newToken);
    await queryClient.invalidateQueries({ queryKey: ['profile'] });

    callback?.();
  };

  const { data, isSuccess } = useProfile(token || undefined, {
    enabled: !!token,
  });

  useEffect(() => {
    if (!isSuccess || !data?.success) return;

    const oldUser = JSON.parse(localStorage.getItem('hof_user') || '{}');

    const inferredCompanyId =
      data.data.companyId ??
      data.data.entityDocument?.find((d: any) => d.companyId)?.companyId ??
      oldUser.companyId ??
      null;

    const mergedUser = {
      ...oldUser,
      ...data.data,
      companyId: inferredCompanyId,
    };

    dispatch(
      setAuthData({
        user: mergedUser,
        role: mergedUser.type || mergedUser.role, // Ensure top-level role is updated
      })
    );

    // localStorage (single source of truth)
    localStorage.setItem('hof_user', JSON.stringify(mergedUser));

    emitUserUpdated();
  }, [data, isSuccess, dispatch]);

  return { run };
}
