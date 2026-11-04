/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { uploadFileApi } from '@/api/common.api';
import { resetKyc } from '@/redux/slices/UserKycNewSlice';
import type { RootState } from '@/redux/store';
import Cookies from 'js-cookie';
import FileNameViewer from '@/components/UploadFile/FileNameViewer';
import CameraCapture from '@/components/CameraCapture';
import { submitUserKycDashboardApi } from '@/api/userKycDashboard.api';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
// import { useNavigate } from 'react-router-dom';
import StatusModal from '@/components/Modals/Status';
import { useForm } from 'react-hook-form';
import RadioFileUpload from '@/components/DocumentsUploadStep/RadioFileUpload';
import CustomButton from '@/components/Base/CustomButton';

// type SecondaryIdType = 'passport' | 'license' | 'aadhaar' | 'voter' | '';

type UserKycDocumentName =
  | 'pan_indian'
  | 'address_proof'
  | 'passport_size_photo'
  | 'secondary_id';

const getFilenameFromStorageUrl = (url?: string) => {
  if (!url) return '';

  try {
    return decodeURIComponent(url.split('?')[0].split('/').pop() || '');
  } catch {
    return url.split('?')[0].split('/').pop() || '';
  }
};

export default function Step4({
  onBack,
  updateKycData,
}: {
  onBack: () => void;
  updateKycData: (data: any) => void;
}) {
  // const navigate = useNavigate();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const theme = useSelector((state: RootState) => state.mode.theme);

  const kyc = useSelector((state: RootState) => state.userKycNew);
  const dispatch = useDispatch();

  const [selfie, setSelfie] = useState<File | null>(() => kyc.selfie || null);
  const [existingSelfieUrl, setExistingSelfieUrl] = useState<
    string | undefined
  >(() => kyc.selfieUrl);
  const [showCamera, setShowCamera] = useState(false);
  const [secondaryIdFile, setSecondaryIdFile] = useState<File | null>(
    () => kyc.secondaryIdFile || null
  );
  const [existingSecondaryIdUrl, setExistingSecondaryIdUrl] = useState<
    string | undefined
  >(() => kyc.secondaryIdFileUrl);
  const submittingRef = useRef(false);
  const selfieInputRef = useRef<HTMLInputElement | null>(null);

  const { control, watch, setValue } = useForm({
    defaultValues: {
      secondaryId: kyc.secondaryIdType || '',
    },
  });

  const secondaryIdType = watch('secondaryId');

  const [errors, setErrors] = useState({
    selfie: '',
    secondaryIdFile: '',
  });
  const hasSelfie = Boolean(selfie || existingSelfieUrl);
  const hasSecondaryId = Boolean(secondaryIdFile || existingSecondaryIdUrl);
  const isValid = hasSelfie && !(secondaryIdType && !hasSecondaryId);
  const token =
    useSelector((state: RootState) => state.authLogin.token) ||
    Cookies.get('hof_token') ||
    '';

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    status: 'success' | 'error';
    message: string;
    onContinue?: () => void;
  }>({
    open: false,
    status: 'success',
    message: '',
    onContinue: () => {},
  });

  useEffect(() => {
    if (kyc.selfie) {
      setSelfie(kyc.selfie);
    }
    if (!kyc.selfie) {
      setSelfie(null);
    }
    setExistingSelfieUrl(kyc.selfieUrl);

    if (kyc.secondaryIdFile) {
      setSecondaryIdFile(kyc.secondaryIdFile);
    }
    if (!kyc.secondaryIdFile) {
      setSecondaryIdFile(null);
    }
    setExistingSecondaryIdUrl(kyc.secondaryIdFileUrl);
    setValue('secondaryId', kyc.secondaryIdType || '');
  }, [
    kyc.secondaryIdFile,
    kyc.secondaryIdFileUrl,
    kyc.secondaryIdType,
    kyc.selfie,
    kyc.selfieUrl,
    setValue,
  ]);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const newErrors = {
      selfie: hasSelfie ? '' : 'Selfie is required',
      secondaryIdFile:
        secondaryIdType && !hasSecondaryId
          ? 'Please upload selected Secondary ID'
          : '',
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      submittingRef.current = false;
      return;
    }

    try {
      const documents: Array<{
        developerName: UserKycDocumentName;
        filename: string;
      }> = [];

      const uploadAndPush = async (
        file: File | null | undefined,
        name: UserKycDocumentName,
        existingUrl?: string
      ) => {
        if (!file) {
          const existingFilename = getFilenameFromStorageUrl(existingUrl);
          if (existingFilename) {
            documents.push({
              developerName: name,
              filename: existingFilename,
            });
          }
          return;
        }

        const res = await uploadFileApi(file);
        if (!res.success) {
          throw new Error(res.message || 'File upload failed');
        }

        documents.push({
          developerName: name,
          filename: res?.data?.meta?.filename ?? '',
        });
      };

      await uploadAndPush(kyc.panFile, 'pan_indian', kyc.panFileUrl);
      await uploadAndPush(selfie, 'passport_size_photo', existingSelfieUrl);
      await uploadAndPush(
        secondaryIdFile,
        'secondary_id',
        existingSecondaryIdUrl
      );
      await uploadAndPush(
        kyc.addressProofFile,
        'address_proof',
        kyc.addressProofFileUrl
      );

      const payload = {
        countryId: 1,
        panNumber: kyc.panNumber,
        occupation: kyc.occupation,
        occupationIndustry: kyc.occupationIndustry,
        monthlyIncome: kyc.monthlyIncome,
        dateOfBirth: kyc.dateOfBirth,
        licenseNumber: kyc.licenseNumber,
        licenseExpiry: kyc.licenseExpiry,
        documents,
        residentialAddress: kyc.residentialAddress,
      };

      const submitRes = await submitUserKycDashboardApi(payload, token);

      if (!submitRes?.success) {
        throw new Error(
          submitRes?.message || submitRes?.error || 'KYC submission failed.'
        );
      }

      dispatch(resetKyc());
      localStorage.removeItem('kyc_data');
      localStorage.removeItem('kyc_step');
      localStorage.removeItem('kyc_resubmitting');

      await runUserFetchFlow(token);

      setStatusModal({
        open: true,
        status: 'success',
        message: 'KYC Submitted Successfully...',
        onContinue: () => {
          localStorage.removeItem('kyc_resubmitting');
          window.location.reload();
        },
        // onContinue: () => {
        //   localStorage.removeItem('kyc_resubmitting');
        //   navigate('/dashboard/kyc');
        // },
      });
    } catch (err: any) {
      console.error(err);
      setStatusModal({
        open: true,
        status: 'error',
        message:
          err?.message ||
          err?.response?.data?.message ||
          'KYC submission failed. Please try again.',
        onContinue: () =>
          setStatusModal((prev) => ({
            ...prev,
            open: false,
          })),
      });
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-[var(--fg)]/10 p-4 lg:p-8 xl:p-10 bg-[var(--card)] text-[var(--fg)] font-work">
        <div className="mb-8">
          <label className="font-new-20 font-medium block mb-1">
            Selfie Photo (Live Capture)<span className="text-red-500">*</span>
          </label>
          <p className="font-16 text-[var(--fg)]/40 mb-3">
            Please capture a clear live selfie to verify your identity.
          </p>

          <div
            onClick={() => !selfie && !existingSelfieUrl && setShowCamera(true)}
            className="flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--fg)]/20 rounded-xl px-4 py-7 lg:py-20 cursor-pointer hover:border-[var(--fg)] transition text-center"
          >
            {!selfie && !existingSelfieUrl && (
              <>
                <img
                  src={
                    theme === 'dark'
                      ? '/images/dashboard/camera-white.svg'
                      : '/images/dashboard/camera-black.svg'
                  }
                  alt="Camera"
                />
                <span className="px-5 py-2 rounded-xl border border-[var(--fg)]/10 bg-[var(--fg)]/5 font-medium hover:bg-[var(--fg)]/8 transition-all duration-300">
                  Click Here to Take Photo
                </span>
                {errors.selfie && (
                  <p className="mt-2 text-sm text-red-500">{errors.selfie}</p>
                )}
              </>
            )}

            <input
              ref={selfieInputRef}
              id="selfieUpload"
              type="file"
              accept="image/*"
              capture="user"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setSelfie(f);
                setExistingSelfieUrl(undefined);
                updateKycData({ selfie: f, selfieUrl: undefined });

                setErrors((e) => ({
                  ...e,
                  selfie: f ? '' : 'Selfie is required',
                }));
              }}
              onBlur={() => {
                setErrors((e) => ({
                  ...e,
                  selfie: selfie ? '' : 'Selfie is required',
                }));
              }}
            />
            {selfie && (
              <FileNameViewer
                file={selfie}
                onRemove={() => {
                  setSelfie(null);
                  setExistingSelfieUrl(undefined);
                  updateKycData({ selfie: null, selfieUrl: undefined });

                  if (selfieInputRef.current) {
                    selfieInputRef.current.value = '';
                  }
                }}
              />
            )}
            {!selfie && existingSelfieUrl && (
              <FileNameViewer
                existingUrl={existingSelfieUrl}
                name={
                  kyc.selfieFileName ||
                  getFilenameFromStorageUrl(existingSelfieUrl)
                }
                onRemove={() => {
                  setExistingSelfieUrl(undefined);
                  updateKycData({ selfie: null, selfieUrl: undefined });
                }}
              />
            )}
          </div>

          {showCamera && (
            <CameraCapture
              onCapture={(file) => {
                setSelfie(file);
                setExistingSelfieUrl(undefined);
                updateKycData({ selfie: file, selfieUrl: undefined });

                if (selfieInputRef.current) {
                  selfieInputRef.current.value = '';
                }
                setErrors((e) => ({
                  ...e,
                  selfie: '',
                }));
                setShowCamera(false);
              }}
              onClose={() => setShowCamera(false)}
            />
          )}
        </div>

        {/* <div className="mb-8">
          <label className="font-new-20 font-medium block mb-1">
            Passport-Size Photo{' '}
            <span className="text-white/40">(Optional)</span>
          </label>
          <p className="font-16 text-white/40 mb-3">
            Upload a recent passport-size photograph if available.
          </p>

          <label
            htmlFor="passportUpload"
            className="flex flex-col items-center justify-center
          gap-3 border border-dashed border-white/20
          rounded-xl px-4 py-7 lg:py-20 cursor-pointer
          hover:border-[#F5F5F5] transition text-center"
          >
            {!passportPhoto && (
              <>
                <p className="font-new-20 text-white/50">
                  Choose a file or drag & drop it here
                </p>
                <p className="font-14 text-white/30">
                  JPEG, PNG formats, up to 4MB
                </p>
                <span className="px-4 py-1.5 rounded-md border border-white/20 font-16 hover:border-[#F5F5F5]">
                  Browse Files
                </span>
              </>
            )}

            <input
              id="passportUpload"
              type="file"
              accept=".jpg,.jpeg,.png"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setPassportPhoto(e.target.files?.[0] || null);
                updateKycData({ passportPhoto: f });
              }}
            />

            {passportPhoto && (
              <FileNameViewer
                file={passportPhoto}
                onRemove={() => setPassportPhoto(null)}
              />
            )}
          </label>
        </div> */}

        <div className="mb-8">
          <RadioFileUpload
            docId="secondaryId"
            label="Secondary ID"
            required={false}
            options={[
              { label: 'Passport', value: 'passport' },
              { label: 'License', value: 'license' },
              { label: 'Aadhaar', value: 'aadhaar' },
              { label: 'Voter', value: 'voter' },
            ]}
            files={{ secondaryId: secondaryIdFile }}
            filesMeta={
              existingSecondaryIdUrl
                ? {
                    secondaryId: {
                      url: existingSecondaryIdUrl,
                    },
                  }
                : undefined
            }
            error={errors.secondaryIdFile}
            watch={watch}
            control={control}
            setValue={setValue}
            onChange={(_, file) => {
              if (!file) {
                setSecondaryIdFile(null);
                setExistingSecondaryIdUrl(undefined);
                setValue('secondaryId', '');
                updateKycData({
                  secondaryIdType: '',
                  secondaryIdFile: null,
                  secondaryIdFileUrl: undefined,
                });
                return;
              }

              setSecondaryIdFile(file);
              setExistingSecondaryIdUrl(undefined);
              updateKycData({
                secondaryIdType: watch('secondaryId'),
                secondaryIdFile: file,
                secondaryIdFileUrl: undefined,
              });
            }}
          />
        </div>

        <div className="mt-10 flex justify-between gap-4">
          <button
            onClick={onBack}
            className="px-10 py-2.5 lg:px-14 rounded-xl border border-[var(--fg)]/10 hover:bg-[var(--fg)]/5 transition-all duration-300 font-medium"
          >
            Back
          </button>

          <CustomButton
            disabled={!isValid || submittingRef.current}
            onClick={handleSubmit}
            className="!mt-0 !px-16"
          >
            {submittingRef.current ? 'Submitting...' : 'Submit KYC'}
          </CustomButton>
        </div>
      </div>
      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        message={statusModal.message}
        onContinue={statusModal.onContinue}
        onClose={() => {
          setStatusModal((prev) => ({ ...prev, open: false }));
        }}
      />
    </div>
  );
}
