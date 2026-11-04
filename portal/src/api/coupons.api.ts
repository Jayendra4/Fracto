
import { axiosRequest } from '@/services';
import type { IApiResponse } from '@/interface';

interface ICouponDetails {
    id: number;
    code: string;
    description: string;
    discountType: string;
    discountValue: string;
    maxDiscountAmount: string;
    minPurchaseAmount: string;
    validTill: string;
}

export interface IApplyCouponResponse {
    code: string;
    discountType: string;
    discountValue: number;
    amount: number;
    maxDiscountValue: number;
    discountAmount: number;
    finalAmount: number;
    coupon: ICouponDetails;
    message: string;
}

export const applyCouponApi = async (
    code: string,
    amount: number
): Promise<IApiResponse<IApplyCouponResponse>> => {
    return axiosRequest<IApplyCouponResponse>({
        method: 'POST',
        endpoint: '/coupons/apply',
        data: {
            code,
            amount,
        },
    });
};
