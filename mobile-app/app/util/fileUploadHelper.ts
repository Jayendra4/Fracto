import * as DocumentPicker from '@react-native-documents/picker';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { uploadFileApi } from '../services/auth.service';
import { Keyboard } from 'react-native';

type SetFieldValue = (value: any) => void;

export const pickDocumentFile = async (setFieldValue: SetFieldValue) => {
    try {
        Keyboard.dismiss();
        const results = await DocumentPicker.pick({
            allowMultiSelection: false,
            type: [
                'image/*',
                DocumentPicker.types.pdf,
            ],
            copyTo: 'cachesDirectory',
        });

        const res = results[0];

        if (res?.size != null && res.size > 300 * 1024 * 1024) {
            Toast.show({
                type: 'error',
                text1: 'File size must be less than 300MB',
            });
            return;
        }

        setFieldValue(res);
    } catch (err: any) {
        if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
            return;
        }

        console.error('PAN picker error:', err);
    }
};

export const pickFromGallery = async () => {
    try {
        Keyboard.dismiss();
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        };

        const result = await launchImageLibrary(options);

        const image = result.assets?.[0];

        if (!image) return;

        if (image?.fileSize != null && image.fileSize > 300 * 1024 * 1024) {
            Toast.show({
                type: 'error',
                text1: 'File size must be less than 300MB',
            });
            return;
        }

        const response = await uploadFileApi({
            file: {
                uri: image.uri!,
                name: image.fileName ?? 'profile.jpg',
                type: image.type ?? 'image/jpeg',
            }
        });
        return response.data;
    } catch (err: any) {
        Toast.show({
            type: 'error',
            text1: 'Failed to upload image',
        });
    }
};