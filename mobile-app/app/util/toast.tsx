import { SuccessToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';

export const toastConfig = {
    success: (props: BaseToastProps) => (
        <SuccessToast
            {...props}
            text1NumberOfLines={3}
            text2NumberOfLines={3}
        />
    ),

    error: (props: BaseToastProps) => (
        <ErrorToast
            {...props}
            text1NumberOfLines={3}
            text2NumberOfLines={3}
        />
    ),
};