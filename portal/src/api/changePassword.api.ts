import { useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';
import type { IAuthChangePasswordReq, IAuthChangePasswordRes } from '@/interface';


const changePassword = async (
  payload: IAuthChangePasswordReq
): Promise<IAuthChangePasswordRes> => {
  const { data } = await axios.post(
    '/accounts/me/change-password',
    payload
  );
  return data;
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: changePassword,
  });
