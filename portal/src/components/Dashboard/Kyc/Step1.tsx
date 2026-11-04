/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { validators } from './kycValidators';
import FileUpload from '@/components/UploadFile/FileUploadrwa';
import type { RootState } from '@/redux/store';
import CustomInput from '@/components/Base/CustomInput';
import CustomButton from '@/components/Base/CustomButton';

interface Step1Props {
  onNext: () => void;
  updateKycData: (data: any) => void;
}

export default function Step1({ onNext, updateKycData }: Step1Props) {
  const user = useSelector((state: RootState) => state.authLogin.user);
  const kycData = useSelector((state: RootState) => state.userKycNew);
  const isBroker = user?.type === 'Broker';

  const [pan, setPan] = useState(kycData.panNumber || '');
  const [dob, setDob] = useState(kycData.dateOfBirth || '');
  const [file, setFile] = useState<File | null>(() => kycData.panFile || null);
  const [existingPanUrl, setExistingPanUrl] = useState<string | undefined>(
    () => kycData.panFileUrl
  );

  const [licenseNumber, setLicenseNumber] = useState(
    kycData.licenseNumber || ''
  );
  const [licenseExpiry, setLicenseExpiry] = useState(
    kycData.licenseExpiry || ''
  );

  const [errors, setErrors] = useState({
    pan: '',
    dob: '',
    file: '',
    licenseNumber: '',
    licenseExpiry: '',
  });
  const validatePan = (value: string) => {
    let err = '';
    if (!value) err = 'PAN is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value))
      err = 'Invalid PAN format (e.g., ABCDE1234F)';

    setErrors((e) => ({ ...e, pan: err }));
    return !err;
  };

  const isValid =
    pan.length === 10 &&
    dob &&
    (file || existingPanUrl) &&
    (!isBroker || (licenseNumber && licenseExpiry));

  useEffect(() => {
    setPan(kycData.panNumber || '');
    setDob(kycData.dateOfBirth || '');
    setFile(kycData.panFile || null);
    setExistingPanUrl(kycData.panFileUrl);
    setLicenseNumber(kycData.licenseNumber || '');
    setLicenseExpiry(kycData.licenseExpiry || '');
  }, [
    kycData.dateOfBirth,
    kycData.licenseExpiry,
    kycData.licenseNumber,
    kycData.panFile,
    kycData.panFileUrl,
    kycData.panNumber,
  ]);

  function handleNext() {
    const newErrors: any = {
      pan: '',
      dob: '',
      file: '',
      licenseNumber: '',
      licenseExpiry: '',
    };
    if (!pan) {
      newErrors.pan = 'PAN is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      newErrors.pan = 'Invalid PAN format';
    }

    if (!dob) {
      newErrors.dob = 'Date of birth is required';
    }

    if (!file && !existingPanUrl) {
      newErrors.file = 'Please upload PAN document';
    }

    if (isBroker) {
      if (!licenseNumber)
        newErrors.licenseNumber = 'License number is required';
      if (!licenseExpiry)
        newErrors.licenseExpiry = 'License expiry is required';
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    onNext();
  }

  return (
    <div className="rounded-2xl border border-[var(--fg)]/10 p-4 lg:p-8 xl:p-10 bg-[var(--card)] text-[var(--fg)] font-work">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <CustomInput
          label="PAN Number"
          type="text"
          value={pan}
          onChange={(v) => {
            const value = v.toUpperCase();
            setPan(value);
            updateKycData({ panNumber: value });
            validatePan(value);
          }}
          onBlur={() => validatePan(pan)}
          placeholder="Enter your PAN Number"
          error={errors.pan}
          required
        />

        <CustomInput
          label="Date of Birth"
          type="date"
          value={dob}
          onChange={(v) => {
            setDob(v);
            updateKycData({ dateOfBirth: v });
            setErrors((e) => ({
              ...e,
              dob: validators.dob(v),
            }));
          }}
          placeholder="Select Date of Birth"
          error={errors.dob}
          required
          max={new Date().toISOString().slice(0, 10)}
        />

        {isBroker && (
          <>
            <CustomInput
              label="License Number"
              type="text"
              value={licenseNumber}
              onChange={(v) => {
                setLicenseNumber(v);
                updateKycData({ licenseNumber: v });
              }}
              placeholder="Enter your License Number"
              error={errors.licenseNumber}
              required
            />

            <CustomInput
              label="License Expiry"
              type="date"
              value={licenseExpiry}
              onChange={(v) => {
                setLicenseExpiry(v);
                updateKycData({ licenseExpiry: v });
              }}
              placeholder="Select License Expiry"
              error={errors.licenseExpiry}
              required
            />
          </>
        )}
      </div>

      {/* <div className="mt-8">
        <label className="font-new-20 block mb-1">
          Upload Your PAN <span className="text-red-500">*</span>
        </label>

        <p className="font-16 text-white/40 mb-3">
          Upload a clear image or PDF of your PAN card for verification.
        </p>

        <label
          htmlFor="panUpload"
          className="flex flex-col items-center justify-center gap-3 border border-dashed border-white/20 rounded-xl px-4 py-7 lg:py-20 cursor-pointer hover:border-[#F5F5F5] transition text-center"
        >
          {!file && (
            <>
              <p className="font-16 text-white/50">
                Choose a File or Drag & Drop It Here
              </p>
              <p className="text-sm text-white/30">
                JPEG, PNG & PDF formats, up to 4MB
              </p>
              <span className="px-4 py-1.5 lg:px-7 lg:py-3 rounded-md border border-white/20 font-16 hover:border-[#F5F5F5]">
                Browse Files
              </span>
            </>
          )}

          <input
            ref={fileInputRef}
            id="panUpload"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
              updateKycData({ panFile: f });

              setErrors((e) => ({
                ...e,
                file: validators.file(f),
              }));
            }}
          />

          {errors.file && (
            <p className="mt-2 text-sm text-red-500">{errors.file}</p>
          )}

          {file && (
            <FileNameViewer
              file={file}
              onRemove={() => {
                setFile(null);
                updateKycData({ panFile: null });

                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            />
          )}
        </label>
      </div> */}

      <FileUpload
        label="Upload Your PAN"
        description="Upload a clear image or PDF of your PAN card for verification."
        required
        accept=".jpg,.jpeg,.png,.pdf"
        maxSizeMB={4}
        file={file}
        existingUrl={existingPanUrl}
        error={errors.file}
        onChange={(f) => {
          if (!f) {
            setFile(null);
            setExistingPanUrl(undefined);

            updateKycData({
              panFile: null,
              panFileUrl: undefined,
            });
            return;
          }

          const previewUrl = URL.createObjectURL(f);

          setFile(f);
          setExistingPanUrl(previewUrl);

          updateKycData({
            panFile: f,
            panFileUrl: previewUrl,
            panFileType: f.type,
            panFileName: f.name,
          });

          setErrors((e) => ({
            ...e,
            file: validators.file(f),
          }));
        }}
      />

      <div className="mt-10 flex justify-end">
        <CustomButton
          disabled={!isValid}
          onClick={handleNext}
          className="!mt-0 !px-16"
        >
          Next
        </CustomButton>
      </div>
    </div>
  );
}
