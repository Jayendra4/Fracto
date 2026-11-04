import { useMutation } from '@tanstack/react-query';
import {
    addBankAccount,
    addPaymentRequest,
    addUpiID,
    addVendorSuggestion,
    assetPurchaseRequest,
    brokerCommissionPayout,
    brokerInvite,
    changePassword,
    chatBlock,
    chatClear,
    chatMarkAsRead,
    createChatRoom,
    createCompanyBasic,
    createDirector,
    createUpiId,
    fcmToken,
    identifierApi,
    initiateDeposit,
    loginApi,
    notificationRead,
    payoutRequest,
    registerApi,
    saveAsset,
    sendCodeApi,
    setBankAccountActive,
    setUpiIdActive,
    submitDirectorDocuments,
    submitMasterRWA,
    updateCompanyMeta,
    updateCompanyTax,
    updateKycApi,
    updateMeApi,
    updateProfileImage,
    updateRoleAsOwner,
    uploadCompanyDocuments,
    uploadFileApi,
    useForgotPassword,
    useResetPassword,
    verifyDepositePayment,
    verifyPasswordApi,
} from '../auth.service';

export const usePasswordCode = () => {
    return useMutation({
        mutationFn: verifyPasswordApi,
    });
};

export const useSendCode = () => {
    return useMutation({
        mutationFn: sendCodeApi,
    });
};

export const useForgotApi = () => {
    return useMutation({
        mutationFn: useForgotPassword,
    });
};

export const useResetApi = () => {
    return useMutation({
        mutationFn: useResetPassword,
    });
};

export const useLoginApi = () => {
    return useMutation({
        mutationFn: loginApi,
    });
};

export const useRegisterApi = () => {
    return useMutation({
        mutationFn: registerApi,
    });
};

export const useUpdateMeApi = () => {
    return useMutation({
        mutationFn: updateMeApi,
    });
};

export const useIdentifierApi = () => {
    return useMutation({
        mutationFn: identifierApi,
    });
};

export const useUploadFile = () => {
    return useMutation({
        mutationFn: uploadFileApi,
    });
};

export const useUpdateKyc = () => {
    return useMutation({
        mutationFn: updateKycApi,
    });
}

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: updateProfileImage,
    });
}

export const useNotificationReadApi = () => {
    return useMutation({
        mutationFn: notificationRead,
    });
}

export const useAddBankAccountApi = () => {
    return useMutation({
        mutationFn: addBankAccount,
    });
}

export const useAddUpiIDApi = () => {
    return useMutation({
        mutationFn: addUpiID,
    });
}

export const useCreateUpiIdApi = () => {
    return useMutation({
        mutationFn: createUpiId,
    });
}

export const useInitiateDepositApi = () => {
    return useMutation({
        mutationFn: initiateDeposit,
    });
}

export const useVerifyPaymentApi = () => {
    return useMutation({
        mutationFn: verifyDepositePayment,
    });
}

export const usePayoutRequestApi = () => {
    return useMutation({
        mutationFn: payoutRequest,
    });
}

export const useCreatePaymentRequestApi = () => {
    return useMutation({
        mutationFn: addPaymentRequest,
    });
}

export const useUpdateRoleAsOwnerApi = () => {
    return useMutation({
        mutationFn: updateRoleAsOwner,
    });
}

export const useBrokerInviteApi = () => {
    return useMutation({
        mutationFn: brokerInvite,
    });
}

export const useBrokerCommissionPayoutApi = () => {
    return useMutation({
        mutationFn: brokerCommissionPayout,
    });
}

export const useAssetPurchaseRequestApi = () => {
    return useMutation({
        mutationFn: assetPurchaseRequest,
    });
}

export const useCreateChatRoomApi = () => {
    return useMutation({
        mutationFn: createChatRoom,
    });
}

export const useFCMTokenApi = () => {
    return useMutation({
        mutationFn: fcmToken,
    });
}

export const useSubmitMasterRWAApi = () => {
    return useMutation({
        mutationFn: submitMasterRWA,
    });
}

export const useChatMarkAsReadApi = () => {
    return useMutation({
        mutationFn: chatMarkAsRead,
    });
}

export const useChatClearApi = () => {
    return useMutation({
        mutationFn: chatClear,
    });
}

export const useChatBlockApi = () => {
    return useMutation({
        mutationFn: chatBlock,
    });
}

export const useSaveAssetApi = () => {
    return useMutation({
        mutationFn: saveAsset,
    });
};

export const useBankAccountActiveApi = () => {
    return useMutation({
        mutationFn: setBankAccountActive,
    });
};

export const useUpiIdActiveApi = () => {
    return useMutation({
        mutationFn: setUpiIdActive,
    });
};

export const useAddVendorSuggestionApi = () => {
    return useMutation({
        mutationFn: addVendorSuggestion,
    });
};

export const useChangePasswordApi = () => {
    return useMutation({
        mutationFn: changePassword,
    });
};

export const useCreateCompanyBasicApi = () => {
    return useMutation({
        mutationFn: createCompanyBasic,
    });
};

export const useUpdateCompanyTaxApi = () => {
    return useMutation({
        mutationFn: updateCompanyTax,
    });
};

export const useUpdateCompanyMetaApi = () => {
    return useMutation({
        mutationFn: updateCompanyMeta,
    });
};

export const useUploadCompanyDocumentsApi = () => {
    return useMutation({
        mutationFn: uploadCompanyDocuments,
    });
};


export const useCreateDirectorApi = () => {
    return useMutation({
        mutationFn: createDirector,
    });
};

export const useSubmitDirectorDocumentsApi = () => {
    return useMutation({
        mutationFn: submitDirectorDocuments,
    });
};