import { axiosRequest } from '@/services';
import { useQuery } from '@tanstack/react-query';

export interface ICountry {
    id: number;
    name: string;
    dialCode: string;
    isoCode: string;
    flag: string;
}

export interface IState {
    name: string;
    code: string;
}

export interface ICity {
    name: string;
}

export const getCountriesApi = async () => {
    return axiosRequest<ICountry[]>({
        method: 'GET',
        endpoint: '/location/countries',
    });
};

export const getStatesApi = async (countryCode: string) => {
    return axiosRequest<IState[]>({
        method: 'GET',
        endpoint: `/location/states?countryCode=${countryCode}`,
    });
};

export const getCitiesApi = async (countryCode: string, stateCode: string) => {
    return axiosRequest<ICity[]>({
        method: 'GET',
        endpoint: `/location/cities?countryCode=${countryCode}&stateCode=${stateCode}`,
    });
};

export function useCountries() {
    return useQuery({
        queryKey: ['countries'],
        queryFn: getCountriesApi,
    });
}

export function useStates(countryCode?: string | string[]) {
    const isEnabled = Array.isArray(countryCode)
        ? countryCode.length > 0
        : !!countryCode && countryCode !== '';

    return useQuery({
        queryKey: ['states', countryCode],
        queryFn: () => getStatesApi(Array.isArray(countryCode) ? countryCode[0] : countryCode!),
        enabled: isEnabled,
    });
}

export function useCities(countryCode?: string | string[], stateCode?: string) {
    const isEnabled = (Array.isArray(countryCode)
        ? countryCode.length > 0
        : !!countryCode && countryCode !== '') && !!stateCode;

    return useQuery({
        queryKey: ['cities', countryCode, stateCode],
        queryFn: () => getCitiesApi(Array.isArray(countryCode) ? countryCode[0] : countryCode!, stateCode!),
        enabled: isEnabled,
    });
}
