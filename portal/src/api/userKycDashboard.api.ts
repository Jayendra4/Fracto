import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// export interface UserKycPayload {
//   firstname: string;
//   lastname: string;
//   dateOfBirth: string | null;
//   panNumber?: string;
//   idNumber?: string;
//   passportNumber?: string;
//   email: string;
//   countryId: number;
//   mobileNumber: string;

//   address: {
//     line1: string;
//     line2?: string;
//     city: string;
//     state: string;
//     country: string;
//     pincode: string;
//   };
//   documents: Array<{
//     developerName: string;
//     filename: string;
//   }>;
// }

export interface UserKycDashboardPayload {
  panNumber?: string;
  dateOfBirth?: string | null;

  occupation?: string;
  occupationIndustry?: string;
  monthlyIncome?: string;

  residentialAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };

  documents?: Array<{
    developerName:
      | 'pan_indian'
      | 'address_proof'
      | 'passport_size_photo'
      | 'secondary_id';
    filename: string;
  }>;
}

export const submitUserKycDashboardApi = async (
  payload: UserKycDashboardPayload,
  token: string
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'PATCH',
    endpoint: '/accounts/kyc/update',
    data: payload,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export function useSubmitUserKycDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      token,
    }: {
      payload: UserKycDashboardPayload;
      token: string;
    }) => submitUserKycDashboardApi(payload, token),

    retry: 2,

    onError: (error: any) => {
      console.error('User KYC failed:', error?.message || error);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
    },
  });
}
