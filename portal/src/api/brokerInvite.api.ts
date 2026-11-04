import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services';
import { useMutation } from '@tanstack/react-query';

export interface IBrokerInviteReq {
  assetId: number;
  assetOwnerEmail: string;
  proposedCommissionPct: number;
  firstName: string;
  lastName: string;
  mobile: number;
  brokerNote?: string;
}

export const brokerInviteApi = async (
  data: IBrokerInviteReq
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'POST',
    endpoint: '/broker/invite',
    data,
  });
};

export function useBrokerInvite() {
  return useMutation({
    mutationFn: (data: IBrokerInviteReq) => brokerInviteApi(data),
  });
}
