import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';

export interface FavouritesResponse {
  count: number;
  data: any[];
}

const fetchMyFavourites = () => {
  return axiosRequest<FavouritesResponse>({
    method: 'GET',
    endpoint: '/assets/favourites',
  });
};

export function useMyFavourites() {
  return useQuery({
    queryKey: ['my-favourites'],
    queryFn: fetchMyFavourites,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
