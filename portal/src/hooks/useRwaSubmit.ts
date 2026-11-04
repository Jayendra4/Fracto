/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset/rwa handling, matches the pattern in rwa.api.ts */
import Cookies from 'js-cookie';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  stripFileFields,
  extractBasicInfo,
  extractMeta,
  uploadAllFiles,
  buildDocumentsPayload,
  type UploadItem,
  type UploadedDocument,
} from '@/utils/rwa.utils';
import {
  resetRwaAsset,
  saveStepData,
  saveStepDocuments,
  setAssetId,
} from '@/redux/slices/rwaAssetSlice';

import { createAssetApi, updateStepsAssetApi } from '@/api/rwa.api';
import { RWA_DOCUMENT_TYPE_CODE_MAP } from '@/constants/rwa';
import { useFetchUserDataFlow } from './useFetchUserDataFlow';
import { brokerInviteApi } from '@/api/brokerInvite.api';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

type WizardStep = 1 | 2 | 3 | 4;

interface UseRwaSubmitParams {
  step1Data: any;
  step2Data: any;
  step3Data: any;
  step4Data: any;
  step1Docs?: any[];
  step2Docs?: any[];
  step3Docs?: any[];
  step4Docs?: any[];
  persistStep: (step: WizardStep) => void;
  saveAllToLocalStorage: (obj: any) => void;
  dispatch: any;
}

import { useState } from 'react';

export const useRwaSubmit = ({
  step1Data,
  step2Data,
  step3Data,
  step4Data,
  step1Docs,
  step2Docs,
  step3Docs,
  step4Docs,
  persistStep,
  saveAllToLocalStorage,
  dispatch,
}: UseRwaSubmitParams) => {
  const navigate = useNavigate();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const { role } = useSelector((state: RootState) => state.authLogin);
  const isBroker = role === 'Broker';
  const { assetId } = useParams();

  const location = useLocation();

  const groupId = location.state?.groupId;

  console.log(groupId, 'groupId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title?: string;
    message?: string;
    subMessage?: string;
  }>({ open: false, status: 'error' });

  const handleStep1Submit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { assetImages, assetVideos, ...restValues } = data || {};

      const existingImageUrls = Array.isArray(assetImages)
        ? assetImages
            .filter((f: any) => !f.file && f.filename)
            .map((f: any) => f.filename)
        : [];

      const existingVideoUrls = Array.isArray(assetVideos)
        ? assetVideos
            .filter((f: any) => !f.file && f.filename)
            .map((f: any) => f.filename)
        : [];

      const uploadItems: UploadItem[] = [];
      if (Array.isArray(assetImages)) {
        assetImages.forEach((f: any, index: number) => {
          const file = f?.file instanceof File ? f.file : f;
          if (file instanceof File) {
            uploadItems.push({
              file,
              documentType: 'ASSET_IMAGE',
              documentName: file.name || `Asset Image ${index + 1}`,
            });
          }
        });
      }

      if (Array.isArray(assetVideos)) {
        assetVideos.forEach((f: any, index: number) => {
          const file = f?.file instanceof File ? f.file : f;
          if (file instanceof File) {
            uploadItems.push({
              file,
              documentType: 'ASSET_VIDEO',
              documentName: file.name || `Asset Video ${index + 1}`,
            });
          }
        });
      }

      let uploadedStep1Docs: UploadedDocument[] = [];
      if (uploadItems.length > 0) {
        uploadedStep1Docs = await uploadAllFiles(uploadItems);
      }

      const newImageUrls = uploadedStep1Docs
        .filter((d) => d.documentType === 'ASSET_IMAGE')
        .map((d) => d.documentUrl);

      const newVideoUrls = uploadedStep1Docs
        .filter((d) => d.documentType === 'ASSET_VIDEO')
        .map((d) => d.documentUrl);

      const finalImageUrls = [...existingImageUrls, ...newImageUrls];
      const finalVideoUrls = [...existingVideoUrls, ...newVideoUrls];

      const cleaned = stripFileFields(restValues) || {};
      const finalStep1Data = {
        ...cleaned,
        assetImages: finalImageUrls,
        assetVideos: finalVideoUrls,
      };

      const allFinalUrls = new Set([...finalImageUrls, ...finalVideoUrls]);
      const keptOldDocs = (step1Docs || []).filter((d: any) =>
        allFinalUrls.has(d.documentUrl)
      );

      const finalStep1Docs = [...keptOldDocs, ...uploadedStep1Docs];

      dispatch(saveStepData({ step: 1, data: finalStep1Data }));
      dispatch(saveStepDocuments({ step: 1, documents: finalStep1Docs }));

      saveAllToLocalStorage({
        step1Data: finalStep1Data,
        step2Data,
        step3Data,
        step4Data,
        step1Docs: finalStep1Docs,
        step2Docs,
        step3Docs,
        step4Docs,
      });

      persistStep(2);
    } catch (err: any) {
      console.error(err);
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Upload Failed',
        message: err.message || 'Something went wrong while uploading files.',
        subMessage: 'Please remove any unsupported file types and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured out so it isn't included in ...values
  const handleStep2Submit = async ({ documents, extra, ...values }: any) => {
    const cleaned = stripFileFields(values);
    dispatch(saveStepData({ step: 2, data: cleaned }));
    const mappedDocs = (documents || []).map((d: any) => ({
      documentType:
        RWA_DOCUMENT_TYPE_CODE_MAP[d.developerName] || d.developerName,
      documentName: d.developerName,
      documentUrl: d.filename,
      remarks: '',
    }));

    dispatch(saveStepDocuments({ step: 2, documents: mappedDocs }));

    saveAllToLocalStorage({
      step1Data,
      step2Data: cleaned,
      step3Data,
      step4Data,
      step1Docs,
      step2Docs: mappedDocs,
      step3Docs,
      step4Docs,
    });

    persistStep(3);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured out so it isn't included in ...values
  const handleStep3Submit = async ({ documents, extra, ...values }: any) => {
    const cleaned = stripFileFields(values);

    dispatch(saveStepData({ step: 3, data: cleaned }));

    const mappedDocs = (documents || []).map((d: any) => ({
      documentType:
        RWA_DOCUMENT_TYPE_CODE_MAP[d.developerName] || d.developerName,
      documentName: d.developerName,
      documentUrl: d.filename,
      remarks: '',
    }));

    dispatch(saveStepDocuments({ step: 3, documents: mappedDocs }));

    const finalStep1 = step1Data || {};
    const finalStep2 = step2Data || {};
    const finalStep3 = cleaned;
    const whyInvested = finalStep1?.whyInvested || [];

    const finalStep1Docs = step1Docs || [];
    const finalStep2Docs = step2Docs || [];
    const finalStep3Docs = mappedDocs;

    const basicInfo = extractBasicInfo(finalStep1, finalStep2);
    const meta = extractMeta(finalStep1, finalStep2, finalStep3, {});

    const documentsPayload = buildDocumentsPayload({
      step1Docs: finalStep1Docs,
      step2Docs: finalStep2Docs,
      step3Docs: finalStep3Docs,
      step4Docs: [],
    });

    const payload = {
      basicInfo,
      meta,
      whyInvested,
      documents: documentsPayload,
    };

    try {
      let res;
      if (assetId) {
        res = await updateStepsAssetApi(assetId, payload); // ✅ UPDATE
      } else {
        res = await createAssetApi(payload); // ✅ CREATE
      }
      // const res = await createAssetApi(payload);
      if (!res.success) {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Asset Submission Failed',
          message: 'Failed to submit asset.',
          subMessage: 'Please try again.',
        });
        return;
      } else {
        setStatusModal({
          open: true,
          status: 'success',
          title: 'Asset Details Submitted',
          message:
            'Your asset details have been successfully updated and submitted.',
        });
      }
      const json = res.data;
      if (json?.id || json?.assetId) {
        const id = json.id || json.assetId;

        dispatch(setAssetId(id));
        localStorage.setItem('rwa_asset_id', JSON.stringify(id));
      }

      if (isBroker) {
        persistStep(4);
      } else {
        dispatch(resetRwaAsset());
        persistStep(1);

        localStorage.removeItem('rwa_asset_id');
        localStorage.removeItem('rwa_asset_step');
        localStorage.removeItem('rwa_asset_step_data');

        // navigate('/dashboard/rwa', {
        //   state: { submissionSuccess: true },
        // });
        // navigate('/groups', {
        //   state: { submissionSuccess: true },
        // });

        navigate(`/primary-club-details/${groupId}`, {
          state: { submissionSuccess: true },
        });
      }
    } catch {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Internal Error',
        message: 'Something went wrong.',
        subMessage: 'Please contact support.',
      });
    }
  };

  // const handleStep4Submit = async ({ documents, __forceStep3Data }: any) => {
  //   const cleanedStep4 = {};

  //   dispatch(saveStepData({ step: 4, data: cleanedStep4 }));

  //   const mappedDocs = (documents || []).map((d: any) => ({
  //     documentType:
  //       RWA_DOCUMENT_TYPE_CODE_MAP[d.developerName] || d.developerName,
  //     documentName: d.developerName,
  //     documentUrl: d.filename,
  //     remarks: '',
  //   }));

  //   dispatch(saveStepDocuments({ step: 4, documents: mappedDocs }));

  //   const finalStep1 = step1Data || {};
  //   const finalStep2 = step2Data || {};
  //   const finalStep3 = __forceStep3Data || step3Data || {};
  //   const finalStep4 = cleanedStep4 || {};

  //   const finalStep1Docs = step1Docs || [];
  //   const finalStep2Docs = step2Docs || [];
  //   const finalStep3Docs = step3Docs || [];
  //   const finalStep4Docs = mappedDocs || step4Docs || [];

  //   saveAllToLocalStorage({
  //     step1Data: finalStep1,
  //     step2Data: finalStep2,
  //     step3Data: finalStep3,
  //     step4Data: finalStep4,
  //     step1Docs: finalStep1Docs,
  //     step2Docs: finalStep2Docs,
  //     step3Docs: finalStep3Docs,
  //     step4Docs: finalStep4Docs,
  //   });

  //   const basicInfo = extractBasicInfo(finalStep1, finalStep2);
  //   const meta = extractMeta(finalStep1, finalStep2, finalStep3, finalStep4);
  //   const documentsPayload = buildDocumentsPayload({
  //     step1Docs: finalStep1Docs,
  //     step2Docs: finalStep2Docs,
  //     step3Docs: finalStep3Docs,
  //     step4Docs: finalStep4Docs,
  //   });

  //   const payload = {
  //     basicInfo,
  //     meta,
  //     documents: documentsPayload,
  //   };

  //   try {
  //     const res = await createAssetApi(payload);
  //     if (!res.success) {
  //       alert('Failed to submit asset. Please try again.');
  //       return;
  //     }

  //     const json = res.data;
  //     if (json?.id || json?.assetId) {
  //       const id = json.id || json.assetId;
  //       dispatch(setAssetId(id));
  //       localStorage.setItem('rwa_asset_id', JSON.stringify(id));
  //     }

  //     dispatch(resetRwaAsset());
  //     persistStep(1);
  //     localStorage.removeItem('rwa_asset_id');
  //     localStorage.removeItem('rwa_asset_step');
  //     localStorage.removeItem('rwa_asset_step_data');

  //     const token = Cookies.get('hof_token');
  //     if (!token) {
  //       navigate('/dashboard/rwa', { state: { submissionSuccess: true } });
  //       return;
  //     }

  //     await runUserFetchFlow(token);
  //     navigate('/dashboard/rwa', { state: { submissionSuccess: true } });
  //   } catch (err) {
  //     console.error('Asset API error', err);
  //     alert('Something went wrong while submitting the asset.');
  //   }
  // };

  const handleBrokerInviteSubmit = async (formData: any) => {
    try {
      const assetId = JSON.parse(
        localStorage.getItem('rwa_asset_id') || 'null'
      );

      if (!assetId) {
        throw new Error('Asset ID not found. Please complete Step 3 first.');
      }

      const payload = {
        assetId,
        assetOwnerEmail: formData.ownerEmail,
        firstName: formData.ownerFirstName,
        lastName: formData.ownerLastName,
        mobile: formData.ownerMobile,
        proposedCommissionPct: Number(formData.proposedCommissionPct),
        brokerNote: formData.brokerNote,
      };

      const res = await brokerInviteApi(payload);

      if (!res?.success) {
        throw new Error(res?.message || 'Broker invite failed');
      }

      dispatch(resetRwaAsset());
      persistStep(1);

      localStorage.removeItem('rwa_asset_id');
      localStorage.removeItem('rwa_asset_step');
      localStorage.removeItem('rwa_asset_step_data');

      const token = Cookies.get('hof_token');
      if (token) {
        await runUserFetchFlow(token);
      }

      navigate('/dashboard/rwa', {
        state: { submissionSuccess: true },
      });
    } catch (err: any) {
      console.error(err);
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Broker Invite Failed',
        message: err?.message || 'Something went wrong while inviting broker.',
      });
    }
  };
  return {
    isSubmitting,
    statusModal,
    setStatusModal,
    handleStep1Submit,
    handleStep2Submit,
    handleStep3Submit,
    // handleStep4Submit,
    handleBrokerInviteSubmit,
  };
};
