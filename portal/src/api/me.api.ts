import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services';
import { useMutation } from '@tanstack/react-query';

export interface IPatchMeReq {
  type: 'AssetOwner' | 'Company';
}

export interface IPatchMeRes {
  accessToken: string;
  type: 'AssetOwner' | 'Company';
}

export const patchMeApi = async (
  data: IPatchMeReq
): Promise<IApiResponse<IPatchMeRes>> => {
  return axiosRequest<IPatchMeRes>({
    method: 'POST',
    endpoint: '/auth/update-type',
    data,
  });
};

export const useUpdateUserType = () => {
  return useMutation({
    mutationFn: (data: IPatchMeReq) => patchMeApi(data),
  });
};
