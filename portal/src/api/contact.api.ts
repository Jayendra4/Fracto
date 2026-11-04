import { axiosRequest } from '@/services';
import { useMutation } from '@tanstack/react-query';

export interface ContactUsPayload {
  name: string;
  email: string;
  mobile: string;
  city: string;
  type: string;
  message: string;
}

export const submitContactUsApi = async (payload: ContactUsPayload) => {
  return axiosRequest({
    method: 'POST',
    endpoint: '/contact-us',
    data: payload,
  });
};

export function useSubmitContactUs() {
  return useMutation({
    mutationFn: submitContactUsApi,
  });
}
