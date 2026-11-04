import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useProfile } from '@/api';
import { setAuthData } from '@/redux/slices/authLoginSlice';

export function useProfileSync(token?: string) {
  const dispatch = useDispatch();

  const { data, isSuccess } = useProfile(token, {
    enabled: !!token,
  });

  useEffect(() => {
    if (!isSuccess || !data?.success) return;

    const user = data.data;

    dispatch(setAuthData({ user }));
    localStorage.setItem('hof_user', JSON.stringify(user));
  }, [isSuccess, data, dispatch]);
}
