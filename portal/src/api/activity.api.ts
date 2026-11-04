import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';

export interface IActivity {
    id: string;
    type: string;
    actorType: string;
    actorId: number;
    entityType: string;
    label: string;
    entityId: number;
    targetId: number;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface ActivitiesResponse {
    count: number;
    skip: number;
    take: number;
    data: IActivity[];
}

export const fetchActivitiesApi = async (params: {
    accountId: number | string;
}): Promise<IApiResponse<ActivitiesResponse>> => {
    return axiosRequest<ActivitiesResponse>({
        method: 'GET',
        endpoint: '/activities',
        params,
    });
};

export function useActivities(params: { accountId: number | string }) {
    return useQuery<IApiResponse<ActivitiesResponse>>({
        queryKey: ['activities', params.accountId],
        queryFn: () => fetchActivitiesApi(params),
        enabled: !!params.accountId,
    });
}
