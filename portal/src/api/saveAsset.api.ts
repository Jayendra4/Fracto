import { axiosRequest } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IApiResponse } from '@/interface';

interface SaveAssetPayload {
  assetId: number;
  isFavourite: boolean;
}

const saveAsset = (payload: SaveAssetPayload) => {
  return axiosRequest<IApiResponse<any>>({
    method: 'POST',
    endpoint: '/assets/save',
    data: payload,
  });
};

export function useSaveAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-favourites'] });
      queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
    },
  });
}
