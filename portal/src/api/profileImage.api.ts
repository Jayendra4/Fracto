import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';
import { useMutation } from '@tanstack/react-query';

interface UpdateProfileImagePayload {
  profileImage: string;
}

interface UpdateProfileImageResponse {
  profileImage: string;
}

export const updateProfileImageApi = async (
  payload: UpdateProfileImagePayload
): Promise<IApiResponse<UpdateProfileImageResponse>> => {
  return axiosRequest<UpdateProfileImageResponse>({
    method: 'POST',
    endpoint: '/accounts/me/profile-image',
    data: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export function useUpdateProfileImage() {
  return useMutation({
    mutationFn: updateProfileImageApi,
  });
}
