import type { IApiResponse } from '@/interface';
import { axiosRequest } from '@/services/api.service';
import { useQuery } from '@tanstack/react-query';

export interface LeadDetails {
    id: number;
    referralUsesType: string;
    usageCount: number;
    rewardLimit: number;
    isCompleted: boolean;
    firstUsedAt: string;
    updatedAt: string;
    brokerReferralCode: string;
    broker: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        dialCode: string;
        mobile: string;
        profileImage: string | null;
        isVerified: boolean;
        countryId: number;
        type: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        isDocumentUploaded: boolean;
    };
    user: {
        id: number;
        name: string;
        email: string;
        mobile: string;
        type: string;
        kyc: {
            status: string;
            submittedAt: string;
            verifier: string;
            personalInfo: {
                panNumber: string;
                passportNumber: string | null;
                emiratiId: string | null;
                occupation: string;
                monthlyIncome: string;
                dateOfBirth: string;
            };
            address: {
                id: number;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                state: string;
                pincode: string;
                createdAt: string;
                updatedAt: string;
            };
            documents: {
                id: number;
                type: string;
                key: string;
                url: string;
                uploadedAt: string;
                isVerified: boolean;
            }[];
        };
        referralCode: string;
    };
}

export async function fetchLeadDetailsApi(id: string | number) {
    return axiosRequest<LeadDetails>({
        method: 'GET',
        endpoint: `/broker/lead/${id}`,
    });
}

export function useLeadDetails(id: string | number) {
    return useQuery<IApiResponse<LeadDetails>>({
        queryKey: ['lead-details', id],
        queryFn: () => fetchLeadDetailsApi(id),
        enabled: !!id,
    });
}
