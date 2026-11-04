import { useEffect, useState } from 'react';
import { createAssetApi, updateStepsAssetApi } from '@/api';
import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export interface IAssetFormData {
  assetType: string;
  assetSubType: string;
  assetTitle: string;
  shortDescription: string;
  ownershipModel: string;
  ownershipModelOther: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  mapUrl: string;
  marketValue: string;
  landArea: string;
  name: string;
  email: string;
  mobile: string;
}

export const isValidMapUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export interface IUploadedDoc {
  documentType: string;
  documentName: string;
  documentUrl: string;
  remarks: string;
}

export const RWA_STEP1_DRAFT_PREFIX = 'rwa_step1_draft_';
const getStep1DraftKey = (accountId?: number | string) =>
  accountId ? `${RWA_STEP1_DRAFT_PREFIX}${accountId}` : null;

type FormFieldEvent =
  | React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  | { target: { name: string; value: string } };

export const useAssetForm = (
  initialState: IAssetFormData,
  uploadedDocs: IUploadedDoc[],
  groupIds: number[],
  setActiveTab: (tab: 'property' | 'owner') => void,
  setPreviewImages: React.Dispatch<React.SetStateAction<string[]>>,
  setImages: React.Dispatch<React.SetStateAction<File[]>>,
  setAsset: (val: null) => void,
  assetId?: number | string,
  existingDocumentUrls?: string[],
  // Optional escape hatch so the caller can fold extra Step 1 state (images,
  // videos, selected clubs — anything that doesn't live in `formData`) into
  // the same saved draft / restore-on-mount lifecycle.
  getDraftExtra?: () => Record<string, unknown>,
  onRestoreDraftExtra?: (extra: Record<string, unknown>) => void
) => {
  const { user } = useSelector((state: RootState) => state.authLogin);

  // For a brand-new asset (no assetId yet), keep Step 1's in-progress data in
  // localStorage — keyed per account — so an accidental refresh doesn't wipe
  // it. Editing an existing asset always re-hydrates from the server (see
  // the `didInitFromAsset` effect in the tab component), so drafts are
  // skipped there to avoid clobbering real saved data.
  const step1DraftKey = !assetId ? getStep1DraftKey(user?.id) : null;

  const [formData, setFormData] = useState<IAssetFormData>(() => {
    if (step1DraftKey) {
      try {
        const saved = localStorage.getItem(step1DraftKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...initialState, ...(parsed.formData ?? parsed) };
        }
      } catch {
        // Corrupt/unavailable draft — fall back to a clean form.
      }
    }
    return initialState;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title?: string;
    message?: string;
    subMessage?: string;
  }>({ open: false, status: 'error' });

  // Restore the extra (non-formData) draft pieces once on mount — images,
  // videos, selected clubs, etc. — via whatever the caller passed in.
  useEffect(() => {
    if (!step1DraftKey || !onRestoreDraftExtra) return;
    try {
      const saved = localStorage.getItem(step1DraftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.extra) onRestoreDraftExtra(parsed.extra);
      }
    } catch {
      // Corrupt/unavailable draft — nothing to restore.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once restore
  }, []);

  // No longer auto-saved on every change — call this from a "Save Draft"
  // button instead. Returns whether the save succeeded.
  const saveDraft = () => {
    if (!step1DraftKey) return false;
    try {
      localStorage.setItem(
        step1DraftKey,
        JSON.stringify({ formData, extra: getDraftExtra?.() })
      );
      return true;
    } catch {
      return false;
    }
  };

  // Wipes the saved draft for this account — call alongside resetting
  // formData/images/etc. from a "Clear Form" button.
  const clearDraft = () => {
    if (step1DraftKey) localStorage.removeItem(step1DraftKey);
  };

  useEffect(() => {
    if (user?.type != 'Broker') {
      setFormData((prev) => ({
        ...prev,
        name: user?.firstname + ' ' + user?.lastname,
        email: user?.email ?? '',
        mobile: user?.mobile ?? '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: FormFieldEvent) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleBlur = (e: FormFieldEvent) => {
    const { name, value } = e.target;
    let error = '';
    const toLabel = (str: string) =>
      str
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim()
        .replace(/^\w/, (c) => c.toUpperCase());

    if (!value && name !== 'mapUrl') {
      error = `${toLabel(name)} is required`;
    }

    if (name === 'mapUrl' && value && !isValidMapUrl(value)) {
      error = 'Enter a valid URL (starting with http:// or https://)';
    }

    if (name === 'shortDescription' && value.length < 50) {
      error = 'Minimum 50 characters required';
    }

    if (name === 'shortDescription' && value.length > 250) {
      error = 'Maximum 250 characters allowed';
    }

    if (name === 'pincode') {
      if (!value.trim()) {
        error = 'PIN code is required';
      } else if (!/^[1-9][0-9]{5}$/.test(value)) {
        error = 'Enter a valid 6-digit PIN code';
      }
    }
    if (name === 'marketValue' && value && Number(value) <= 0) {
      error = 'Market Value must be greater than 0 ';
    }

    if (name === 'landArea' && value && Number(value) <= 0) {
      error = 'Area must be greater than 0 Sq/Mtr';
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  useEffect(() => {
    const imageCount = uploadedDocs.filter(
      (d) => d.documentType === 'ASSET_IMAGE'
    ).length;
    if (imageCount >= 5) {
      setErrors((prev) => {
        // Bail out (return the same reference) when there's nothing to
        // clear — otherwise this fires a state update, and thus a
        // re-render, every single time this effect runs even when
        // nothing actually changed.
        if (!('images' in prev)) return prev;
        const updated = { ...prev };
        delete updated.images;
        return updated;
      });
    }
  }, [uploadedDocs]);

  const validateForm = (mode: 'property' | 'full') => {
    const newErrors: Record<string, string> = {};

    if (!groupIds.length) {
      newErrors.groupId = 'Primary Club is required';
    }

    const fields: (keyof IAssetFormData)[] = [
      'assetType',
      'assetSubType',
      'assetTitle',
      'shortDescription',
      'country',
      'state',
      'city',
      'pincode',
      'marketValue',
      'landArea',
      'ownershipModel',
    ];

    fields.forEach((key) => {
      const value = formData[key];
      if (!value) {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (s) => s.toUpperCase());
        newErrors[key] = `${label} is required`;
      }
    });

    if (formData.shortDescription && formData.shortDescription.length < 50) {
      newErrors.shortDescription = 'Minimum 50 characters required';
    }

    if (formData.shortDescription && formData.shortDescription.length > 250) {
      newErrors.shortDescription = 'Maximum 250 characters allowed';
    }

    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter valid pincode';
    }

    if (formData.mapUrl && !isValidMapUrl(formData.mapUrl)) {
      newErrors.mapUrl =
        'Enter a valid URL (starting with http:// or https://)';
    }

    if (
      formData.ownershipModel === 'Others' &&
      !formData.ownershipModelOther.trim()
    ) {
      newErrors.ownershipModelOther = 'Please enter ownership model';
    }

    const imageCount = uploadedDocs.filter(
      (d) => d.documentType === 'ASSET_IMAGE'
    ).length;
    if (imageCount < 5) {
      newErrors.images = 'Minimum 5 images required';
    }

    if (mode === 'full') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
        newErrors.name = 'Name can only contain letters';
      }

      if (!formData.mobile.trim()) {
        newErrors.mobile = 'Mobile is required';
      } else if (!/^(\+91)[6-9]\d{9}$/.test(formData.mobile.trim())) {
        newErrors.mobile = 'Enter valid Indian (+91) number';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Enter a valid email address';
      }

      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = 'Invalid email address';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const buildPayload = () => {
    const metaMap = {
      state: 'String',
      city: 'String',
      country: 'String',
      pincode: 'String',
      mapUrl: 'String',
      landArea: 'Number',
      assetSubType: 'String',
      marketValue: 'Number',
      shortDescription: 'String',
    };

    const meta = Object.entries(metaMap).map(([k, t]) => ({
      metaKey: k,
      metaValue: String(formData[k as keyof IAssetFormData] || ''),
      metaType: t,
    }));

    // The backend appends whatever `documents` we send rather than
    // replacing/deduping — only send docs that aren't already on the
    // asset, otherwise already-uploaded images get duplicated on resubmit.
    const newDocsOnly = (
      existingDocumentUrls
        ? uploadedDocs.filter(
            (d) => !existingDocumentUrls.includes(d.documentUrl)
          )
        : uploadedDocs
    ).map((d) => ({
      ...d,
      // Backend expects just the stored filename, not the full storage URL.
      documentUrl: d.documentUrl.split('/').pop() ?? d.documentUrl,
    }));

    return {
      basicInfo: {
        assetType: formData.assetType,
        assetTitle: formData.assetTitle,
        ownershipModel: formData.ownershipModel,
        ownershipModelOther:
          formData.ownershipModel === 'Others'
            ? formData.ownershipModelOther
            : '',
        currentOwnerName: formData.name,
      },
      meta,
      documents: newDocsOnly,
      ...(groupIds.length ? { createGroup: true, groupIds } : {}),
      ownerDetails: {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
      },
    };
  };

  const handleNext = () => {
    const valid = validateForm('property');
    if (!valid) return; // ✅
    setActiveTab('owner');
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const valid = validateForm('full');
    if (!valid) return; // ✅
    setLoading(true); // ✅ start loading
    try {
      const payload = buildPayload();
      const res = assetId
        ? await updateStepsAssetApi(assetId, payload)
        : await createAssetApi(payload);

      if (!res?.success) {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: res?.message || 'Asset created successfully',
        });
        return res;
      }
      // ✅ success

      setStatusModal({
        open: true,
        status: 'success',
        title: 'Success',
        message: assetId
          ? 'Asset details updated and resubmitted for review.'
          : 'Asset created successfully',
      });

      if (res?.success) {
        setActiveTab('property');
        setTimeout(() => {
          setAsset(null);
        }, 4000);

        if (!assetId) {
          setFormData(initialState);
          setPreviewImages([]);
          setImages([]);
          if (step1DraftKey) localStorage.removeItem(step1DraftKey);
        }
      }

      return res;
    } catch {
      setStatusModal({
        open: true,
        status: 'error',
        message: 'Something went wrong',
      });
    } finally {
      setLoading(false); // ✅ stop loading (always runs)
    }
  };

  return {
    formData,
    errors,
    handleChange,
    handleBlur,
    handleNext,
    handleSubmit,
    statusModal,
    setStatusModal,
    setFormData,
    loading,
    saveDraft,
    clearDraft,
  };
};
