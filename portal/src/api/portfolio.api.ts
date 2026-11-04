import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';

export interface PortfolioResponse {
  count: number;
  data: any[];
  [key: string]: any;
}

export interface FetchMyPortfolioParams {
  skip?: number;
  take?: number;
  search?: string;
  sortBy?: string;
  order?: string;
}

const fetchMyPortfolio = (params: FetchMyPortfolioParams = {}) => {
  const { skip = 0, take = 10, search, sortBy, order } = params;
  return axiosRequest<PortfolioResponse>({
    method: 'GET',
    endpoint: '/asset-purchase/me/portfolio',
    params: {
      skip,
      take,
      ...(search ? { search } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(order ? { order } : {}),
    },
  });
};

export function useMyPortfolio(params: FetchMyPortfolioParams = {}) {
  const { skip = 0, take = 10, search, sortBy, order } = params;
  return useQuery({
    queryKey: ['my-portfolio', skip, take, search, sortBy, order],
    queryFn: () => fetchMyPortfolio({ skip, take, search, sortBy, order }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
