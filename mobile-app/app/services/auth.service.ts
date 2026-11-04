import { useMutation, useQuery } from '@tanstack/react-query';
import { AccountType, LoginPanel, PaymentMethodType } from '../store/authSlice.types';
import api from './api';
import { RoleAsAssetOwner } from '../views/SelectRoleAsAssetOwner';

export type UserKycDocumentName =
    | 'pan_indian'
    | 'address_proof'
    | 'passport_size_photo'
    | 'secondary_id'
    | 'selfie_photo';

export interface KycUpdatePayload {
    firstname: string | undefined;
    lastname: string | undefined;
    accountId: number | undefined;
    countryId: number | undefined;
    panNumber: string;
    passportNumber?: string;
    emiratiId?: string;
    occupation: string;
    monthlyIncome: string;
    dateOfBirth: string;
    documents: {
        developerName: UserKycDocumentName;
        filename: string;
    }[];
    residentialAddress: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
    };
}

export interface ResetPasswordType {
    code: string;
    newPassword: string;
    mobile?: string;
    email?: string;
}

export interface AddBankAccount {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
}

export interface AddUpiAccount {
    upiId: string;
    qrCode?: string | null;
}

export type BrokerInvitePayload = {
    assetId: number;
    assetOwnerEmail: string;
    firstName: string;
    lastName: string;
    mobile: string;
    proposedCommissionPct: number;
    brokerNote?: string;
};

export type MasterRWABasicInfo = {
    assetType: string;
    assetTitle: string;
    currentOwnerName: string;
    ownershipModel: string;
};

export type MasterRWAMeta = {
    metaKey: string;
    metaValue: string | number;
    metaType: string;
};

export type MasterRWADocument = {
    documentType: string;
    documentName: string;
    documentUrl: string;
    remarks: string;
};

export type SubmitMasterRWAPayload = {
    basicInfo: MasterRWABasicInfo;
    meta: MasterRWAMeta[];
    documents: MasterRWADocument[];
};

interface BrokerCommissionParams {
    brokerId: string;
    skip: number;
    take: number;
    type: string;
};

export interface CompanyBasicPayload {
    legalEntityName: string;
    tradeName?: string;

    cinOrTradeLicenseNo: string;
    dateOfIncorporation: string;
    entityType: string;

    registeredAddressLine1: string;
    registeredCity: string;
    registeredState: string;
    registeredCountry: string;
    registeredPincode: string;

    industryType: string;
    companyEmail: string;
    companyPhone: string;
    website?: string;
}

export interface CompanyTaxPayload {
    panNumber: string;
    gstNumber?: string;
    tanNumber?: string;
    tradeLicenseExpiryDate: string;
    placeOfBusinessProofType: string;
}

export interface CompanyMetaPayload {
    natureOfBusiness: string;
    businessDescription: string;

    expectedMonthlyTransactionVolume: number;
    expectedSourceOfFunds: string;

    countriesOfOperation: string[];

    isCompanyPubliclyListed: boolean;
}

export interface CreateDirectorPayload {
    firstName: string;
    lastName: string;
    roleInCompany: string;
    dateOfBirth: string;
    nationality: string;
    panNumber: string;
    passportNumber: string;
    email: string;
    mobileNumber: string;

    address: {
        line1: string;
        line2: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };

    emiratesIdNumber?: string;

}

export interface CreateDirectorParams {
    companyId: string;
    payload: CreateDirectorPayload;
}

export interface DirectorDocumentPayload {
    documentTypeCode: string;
    url: string;
    documentIdentifier: string;
    validFrom: string;
    validUpto: string;
    apiVerified: boolean;
}

export interface SubmitDirectorDocumentsParams {
    companyId: string;
    directorId: string;
    documents: DirectorDocumentPayload[];
}

export type VendorSuggestionPayload = {
    vendorName: string;
    category: string;
    description?: string;
    website?: string;
    email: string;
    mobile: string;
};

export type OnboardedTypeStatus = "Draft" | "Available" | "Funded" | "Exited";
export interface ApplyCouponParams {
    code: string;
    assetId: number;
    fractions: number;
}

export const verifyPasswordApi = (payload: {
    email?: string;
    mobile?: string;
    password: string;
}) => {
    return api.post('/auth/verify-password', payload);
};

export const sendCodeApi = (payload: {
    email?: string;
    mobile?: string;
    country?: string;
    type: string;
}) => {
    return api.post('/auth/send-code', payload);
};

export const useForgotPassword = (payload: {
    email?: string;
    mobile?: string
}) => {
    return api.post('/auth/forgot-password', payload);
};

export const useResetPassword = (payload: ResetPasswordType) => {
    return api.post('/auth/reset-password', payload);
};

export const loginApi = (payload: {
    email?: string;
    mobile?: string;
    password: string;
    emailVerificationCode?: string;
    mobileVerificationCode?: string;
    loginPanel: LoginPanel;
}) => {
    return api.post('/auth/login', payload);
};

export const registerApi = (payload: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    dialCode: string;
    mobile: string;
    countryId: number;
    accountType: AccountType;
    emailVerificationCode: string;
    mobileVerificationCode?: string;
    referralCode?: string;
}) => {
    return api.post('/auth/register', payload);
};

export const updateMeApi = (payload: {
    username?: string,
    firstname?: string,
    lastname?: string,
    type?: string,
    email?: string,
    dialCode?: string,
    mobile?: string,
    country?: string,
    meta?: {
        occupation?: string;
        monthlyIncome?: string;
        panNumber?: string;
        passportNumber?: string;
        dateOfBirth?: string;
    },
}) => {
    return api.patch('/accounts/me', payload);
};

export const identifierApi = (payload: {
    email?: string;
    mobile?: string;
}) => {
    return api.post('/auth/check-identifier', payload);
};

export const uploadFileApi = async (payload: {
    file: { uri: string; name: string; type: string; fileName?: string };
    folder?: string;
    checkFile?: boolean;
}) => {
    const formData = new FormData();

    let fileUri = payload.file.uri;
    if (payload.checkFile && !fileUri.startsWith('file://')) {
        fileUri = 'file://' + fileUri;
    }

    formData.append('file', {
        uri: fileUri,
        name: payload?.file?.name || payload?.file?.fileName,
        type: payload?.file?.type,
    } as any);

    if (payload.folder) {
        formData.append('folder', payload.folder);
    }

    return api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const updateKycApi = (payload: KycUpdatePayload) => {
    return api.patch("/accounts/kyc/update", payload);
};

export const updateProfileImage = (payload: { profileImage: string }) => {
    return api.post("/accounts/me/profile-image", payload);
};

export const notificationRead = (notificationId: number) => {
    return api.patch(`/notification/${notificationId}/read`);
};

export const addBankAccount = (payload: AddBankAccount) => {
    return api.post("/bank-account", payload);
};

export const addUpiID = (payload: AddUpiAccount) => {
    return api.post("/upi-account", payload);
};

export const createUpiId = (payload: {
    upiId: string;
    qrCode?: null;
}) => {
    return api.post("/upi-account", payload);
};

export const initiateDeposit = (payload: {
    amount: number,
    methodType: PaymentMethodType,
    bankAccountId?: number,
    upiAccountId?: number,
}) => {
    return api.post("/payment-request/deposit/initiate", payload);
};

export const verifyDepositePayment = (payload: {
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    purchase_payment_id: number,
}) => {
    return api.post("/payment-request/verify-payment", payload);
};

export const payoutRequest = (payload: {
    amount: number,
    methodType: PaymentMethodType,
    fundAccountId: string,
    bankAccountId?: number,
    upiAccountId?: number,
}) => {
    return api.post("/payment-request/payout-request", payload);
};

export const addPaymentRequest = (payload: {
    requestType: string,
    methodType: string,
    amount: number,
    bankAccountId?: number,
    upiAccountId?: number,
    utrNumber?: string;
    screenshot?: string;
}) => {
    return api.post("/payment-request", payload);
};

export const updateRoleAsOwner = (payload: {
    type: RoleAsAssetOwner,
}) => {
    return api.post("/auth/update-type", payload);
};

export const brokerInvite = (payload: BrokerInvitePayload) => {
    return api.post("/broker/invite", payload);
};

export const brokerCommissionPayout = (payload: {
    amount: string,
}) => {
    return api.post("/broker/commission/payout-request", payload);
};

export const assetPurchaseRequest = (payload: {
    assetId: number,
    couponCode?: string,
    fractions: number,
}) => {
    return api.post("/asset-purchase", payload);
};

export const fcmToken = (payload: {
    token: string,
}) => {
    return api.post("/auth/device-token", payload);
};

export const createChatRoom = (payload: {
    type: "Direct" | "Group",
    participantIds: string[],
}) => {
    return api.post("/chats", payload);
};

export const submitMasterRWA = (payload: SubmitMasterRWAPayload) => {
    return api.post("/assets", payload);
};

export const chatMarkAsRead = (id: string) => {
    return api.post(`/chats/${id}/mark-as-read`);
};

export const chatClear = (id: string) => {
    return api.post(`/chats/${id}/clear`);
};

export const chatBlock = (id: string) => {
    return api.post(`/chats/${id}/block`);
};

export const setBankAccountActive = ({
    bankId,
    payload,
}: {
    bankId: number;
    payload: {
        accountHolderName?: string;
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        isActive?: boolean;
        isDeleted?: boolean;
    };
}) => {
    return api.patch(`/bank-account/${bankId}/status`, payload);
};

export const setUpiIdActive = ({
    upiAccountId,
    payload,
}: {
    upiAccountId: number;
    payload: {
        upiId?: string;
        qrCode?: string;
        isActive?: boolean;
        isDeleted?: boolean
    };
}) => {
    return api.patch(`/upi-account/${upiAccountId}/status`, payload);
};

export const addVendorSuggestion = (payload: VendorSuggestionPayload) => {
    return api.post("/vendors/suggestions", payload);
};

export const changePassword = (payload: {
    oldPassword: string;
    newPassword: string;
}) => {
    return api.post("/accounts/me/change-password", payload);
};

export const useUserWalletApi = () => {
    return useQuery({
        queryKey: ['user-wallet'],
        queryFn: async () => {
            const res = await api.get("/users/me/wallets");
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useAssetApi = ({
    search,
    skip = 0,
    take = 10,
    assetStatus,
    isVisible,
    newlyAdded,
    assetSubType,
}: {
    search?: string;
    skip?: number;
    take?: number;
    assetStatus?: string;
    isVisible?: boolean;
    newlyAdded?: boolean;
    assetSubType?: string;
}) => {
    return useQuery({
        queryKey: ['asset', search, skip, take, assetStatus, isVisible, newlyAdded, assetSubType],
        queryFn: async () => {
            const res = await api.get("/assets", {
                params: {
                    ...(search && { search }),
                    skip,
                    take,
                    newlyAdded,
                    ...(assetStatus && { assetStatus }),
                    ...(isVisible && { isVisible }),
                    ...(assetSubType && { assetSubType }),
                },
            });
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};


export const useAssetByIdApi = (id: number) => {
    return useQuery({
        queryKey: ['asset', id],
        queryFn: async () => {
            const res = await api.get(`/assets/${id}`);
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useAssetHistoryByIdApi = (assetId: number) => {
    return useQuery({
        queryKey: ['asset-history', assetId],
        queryFn: async () => {
            const res = await api.get(`/asset-purchase/${assetId}/purchase-history`);
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useFavouriteAssetsApi = ({
    skip = 0,
    take = 10,
}: {
    skip?: number;
    take?: number;
}) => {
    return useQuery({
        queryKey: ['favourite', skip, take],
        queryFn: async () => {
            const res = await api.get("/assets/favourites", {
                params: {
                    skip,
                    take,
                }
            });
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useOnboardedAssetApi = ({
    skip = 0,
    take = 10,
    assetStatus,
}: {
    skip?: number;
    take?: number;
    assetStatus?: OnboardedTypeStatus;
}) => {
    return useQuery({
        queryKey: ['onboarded', skip, take, assetStatus],
        queryFn: async () => {
            const res = await api.get("/assets/me", {
                params: {
                    skip,
                    take,
                    ...(assetStatus && { assetStatus }),
                }
            });
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useVendorListApi = (page: number, limit: number) => {
    return useQuery({
        queryKey: ['vendor-list', page],
        queryFn: async () => {
            const skip = (page - 1) * limit;
            const res = await api.get(
                `/vendors?skip=${skip}&take=${limit}`
            );

            return res.data;
        },

        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};

export const useNotificationApi = ({
    skip = 0,
    take = 10,
}: {
    skip?: number;
    take?: number;
}) => {
    return useQuery({
        queryKey: ['notification', skip, take],
        queryFn: async () => {
            const res = await api.get("/notification/me", {
                params: {
                    skip,
                    take,
                },
            });
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};


export const usePortfolioApi = ({
    skip = 0,
    take = 10,
}: {
    skip?: number;
    take?: number;
}) => {
    return useQuery({
        queryKey: ['portfolio', skip, take],
        queryFn: async () => {
            const res = await api.get("/asset-purchase/me/portfolio", {
                params: {
                    skip,
                    take,
                },
            });
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};

export const useGetUpiIdApi = () => {
    return useQuery({
        queryKey: ['upi-id'],
        queryFn: async () => {
            const res = await api.get("/upi-account/me");
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetBankAccountApi = () => {
    return useQuery({
        queryKey: ['bank-account'],
        queryFn: async () => {
            const res = await api.get("/bank-account/me");
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetPaymentRequestApi = (
    params?: {
        skip?: number;
        take?: number;
        status?: string;
        requestType?: string;
    }
) => {
    const {
        skip = 0,
        take = 10,
        status,
        requestType,
    } = params || {};

    return useQuery({
        queryKey: ['payment-request', skip, take, status, requestType],
        queryFn: async () => {
            const res = await api.get("/payment-request", {
                params: {
                    skip,
                    take,
                    status,
                    requestType,
                },
            });
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};


export const useGetCountriesApi = () => {
    return useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const res = await api.get("/location/countries");
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetStatesApi = (countryCode: string, search?: string) => {
    return useQuery({
        queryKey: ['states', countryCode, search],
        queryFn: async () => {
            const res = await api.get("/location/states", {
                params: { countryCode, search },
            });
            return res.data;
        },
        enabled: !!countryCode,
        staleTime: 1000 * 60,
    });
};

export const useGetCitiesApi = (countryCode: string, stateCode: string, search?: string) => {
    return useQuery({
        queryKey: ['cities', countryCode, stateCode, search],
        queryFn: async () => {
            const res = await api.get("/location/cities", {
                params: { countryCode, stateCode, search }
            });
            return res.data;
        },
        enabled: !!countryCode && !!stateCode,
        staleTime: 1000 * 60,
    });
};

export const useGetBrokerInviteApi = ({
    brokerId,
    skip = 0,
    take = 10
}: { brokerId: string, skip: number, take: number }) => {
    return useQuery({
        queryKey: ['broker-invite', brokerId, skip, take],
        queryFn: async () => {
            const res = await api.get(`/broker/invite-owners`, {
                params: {
                    brokerId,
                    skip,
                    take,
                },
            });
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};

export const useGetCommissionSummaryApi = ({
    fromDate,
    toDate,
}: { fromDate?: string; toDate?: string }) => {
    return useQuery({
        queryKey: ['commission-summary', fromDate, toDate],
        queryFn: async () => {
            const res = await api.get("/broker/commission-summary", {
                params: {
                    ...(fromDate && { fromDate }),
                    ...(toDate && { toDate }),
                }
            });
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetBrokerCommissionHistoryApi = ({
    brokerId,
    skip,
    take,
    type,
}: BrokerCommissionParams) => {
    return useQuery({
        queryKey: ['broker-commission', brokerId, skip, take, type],
        queryFn: async () => {
            const res = await api.get("/broker/commissions", {
                params: {
                    brokerId,
                    skip,
                    take,
                    type,
                }
            });
            return res.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60,
    });
};

export const useGetBrokerLeadsApi = ({
    brokerId,
    type,
    search,
    skip,
    take,
}: { brokerId: string, type?: string, search?: string, skip: number, take: number }) => {
    return useQuery({
        queryKey: ['broker-leads', brokerId, type, search, skip, take],
        queryFn: async () => {
            const res = await api.get("/broker/leads", {
                params: {
                    brokerId,
                    ...(type && { type }),
                    ...(search && { search }),
                    skip,
                    take,
                },
            });
            return res.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60,
    });
};

export const useGetBrokerLeadById = (id: string) => {
    return useQuery({
        queryKey: ['broker-lead', id],
        queryFn: async () => {
            const res = await api.get(`/broker/lead/${id}`)
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetInvestorActivityApi = (investorId: string) => {
    return useQuery({
        queryKey: ['investor-activity', investorId],
        queryFn: async () => {
            const res = await api.get(`/activities?accountId=${investorId}`);
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetBrokerDashboardApi = () => {
    return useQuery({
        queryKey: ['broker-dashboard'],
        queryFn: async () => {
            const res = await api.get("/broker/dashboard");
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetBrokerCommissionApi = () => {
    return useQuery({
        queryKey: ['broker-commission'],
        queryFn: async () => {
            const res = await api.get("/broker/locks-commission");
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetChatsApi = (
    id: string,
    search: string,
    skip: number,
    take: number
) => {
    return useQuery({
        queryKey: ['chats', id, search, skip, take],
        queryFn: async () => {
            const res = await api.get("/chats", {
                params: {
                    accountId: id,
                    ...(search && { search }),
                    skip,
                    take,
                },
            });

            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetChatMessages = ({
    skip,
    take,
    search,
    accountId,
    chatRoomId,
}: {
    skip: number;
    take: number;
    search?: string;
    accountId: number;
    chatRoomId: number;
}) => {
    return useQuery({
        queryKey: ['chat-messages', skip, take, search, accountId, chatRoomId],
        queryFn: async () => {
            const res = await api.get("/chats/message", {
                params: {
                    skip,
                    take,
                    ...(search && { search }),
                    accountId,
                    chatRoomId
                },
            });
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetAllUsers = (
    accountId: number,
    search: string,
    skip: number,
    take: number
) => {
    return useQuery({
        queryKey: ['get-users', accountId, search, skip, take],
        queryFn: async () => {
            const res = await api.get("/chats/available-users", {
                params: {
                    accountId,
                    ...(search && { search }),
                    skip,
                    take,
                },
            });
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const useGetAllBanks = () => {
    return useQuery({
        queryKey: ['get-banks'],
        queryFn: async () => {
            const res = await api.get("/bank-account");
            return res.data;
        },
        staleTime: 1000 * 60,
    });
};

export const saveAsset = async ({
    assetId,
    isFavourite,
}: {
    assetId: number;
    isFavourite: boolean;
}) => {
    const res = await api.post('/assets/save', {
        assetId,
        isFavourite,
    });

    return res.data;
};

export const createCompanyBasic = async (
    payload: CompanyBasicPayload
) => {
    const res = await api.post("/company/basic", payload);
    return res.data;
};

export const updateCompanyTax = async ({
    companyId,
    payload,
}: {
    companyId: string;
    payload: CompanyTaxPayload;
}) => {
    const res = await api.patch(
        `/company/tax/${companyId}`,
        payload
    );
    return res.data;
};


export const updateCompanyMeta = async ({
    companyId,
    payload,
}: {
    companyId: string;
    payload: CompanyMetaPayload;
}) => {
    const res = await api.patch(
        `/company/meta/${companyId}`,
        payload
    );

    return res.data;
};


export const uploadFile = async (file: any) => {
    const formData = new FormData();

    formData.append("file", {
        uri: file.uri,
        name: file.fileName || file.name || "file.jpg",
        type: file.type || "image/jpeg",
    });

    const res = await api.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};


export const uploadCompanyDocuments = async ({
    companyId,
    documents,
}: {
    companyId: string;
    documents: { documentTypeCode: string; file: any }[];
}) => {

    const uploadedFiles = [];

    for (let doc of documents) {
        const uploadRes = await uploadFile(doc.file);

        uploadedFiles.push({
            documentTypeCode: doc.documentTypeCode,
            fileName: uploadRes.meta.filename,
            name: doc.file.name,
            type: doc.file.type,
        });
    }

    const res = await api.post(
        `/company/document/upload/${companyId}`,
        {
            documents: uploadedFiles,
        }
    );

    return res.data;
};

export const createDirector = async ({
    companyId,
    payload,
}: CreateDirectorParams) => {
    const res = await api.post(
        `/companies/${companyId}/directors`,
        payload
    );
    return res.data;
};

export const submitDirectorDocuments = async ({
    companyId,
    directorId,
    documents,
}: {
    companyId: string;
    directorId: string;
    documents: { documentTypeCode: string; file: any }[];
}) => {

    const uploadedFiles = [];

    for (let doc of documents) {
        if (!doc.file?.uri) {
            console.log("Invalid file:", doc.file);
            continue;
        }

        const uploadRes = await uploadFile(doc.file);

        uploadedFiles.push({
            documentTypeCode: doc.documentTypeCode.toLowerCase(),
            url: uploadRes.meta.filename,
            documentIdentifier: "",
            validFrom: new Date().toISOString(),
            validUpto: new Date(
                new Date().setFullYear(new Date().getFullYear() + 10)
            ).toISOString(),
            apiVerified: false,
        });
    }

    const response = await api.post(
        `/companies/${companyId}/directors/document/upload/${directorId}`,
        {
            documents: uploadedFiles,
        }
    );

    return response.data;
};

export const useApplyCoupon = () => {
    return useMutation({
        mutationFn: async (payload: ApplyCouponParams) => {
            const response = await api.post("/coupons/apply", payload);
            return response.data;
        },
    });
};

export const useCompanyBasicDetail = () => {
    return useQuery({
        queryKey: ["companyBasicDetail"],
        queryFn: async () => {
            const res = await api.get("/company");
            return res.data;
        },
    });
};

export const useBrokerReferredAssets = (
    status: string,
    page: number,
    limit: number
) => {
    return useQuery({
        queryKey: ["broker-referred-assets", status, page],

        queryFn: async () => {
            const res = await api.get(
                `/broker/owner-approval-assets?status=${status}&skip=${(page - 1) * limit
                }&take=${limit}`
            );
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
};

export const useUpdateAssetStatus = () => {
    return useMutation({
        mutationFn: async (payload: { id: number; status: string }) => {
            const res = await api.patch(`/assets`, {
                assetId: payload.id,
                status: payload.status,
            });
            return res.data;
        },
    });
};
export const useGetPropertyDetailIcons = () => {
    return useQuery({
        queryKey: ["detail-icons"],
        queryFn: async () => {
            const res = await api.get("/icon");
            return res.data;
        },
    });
};