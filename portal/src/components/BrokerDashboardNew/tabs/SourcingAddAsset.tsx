/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset handling, matches the pattern in rwa.api.ts */
import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import type { FieldValues } from 'react-hook-form';
import CompanyForm from '@/components/Form/CompanyForm';
import {
  assetOnboardingGroup1,
  assetOnboardingGroup2,
  assetOnboardingGroup3,
  assetOnboardingGroup4,
} from '@/constants/assetOnboarding.constants';
import { brokerInviteApi } from '@/api/brokerInvite.api';
import {
  FiArrowRight,
  FiHeadphones,
  FiPlus,
  FiX,
  FiChevronDown,
  FiCheck,
  FiMapPin,
} from 'react-icons/fi';
import { CiCircleInfo } from 'react-icons/ci';
import { toast } from 'react-toastify';
import {
  useCities,
  useCountries,
  useStates,
  useAssetById,
  updateStepsAssetApi,
  requestListingApi,
  uploadFileApi,
} from '@/api';
import type { ICity, ICountry, IState } from '@/api';
import { AssetSubTypes, AssetTypes, OwnerMode } from '@/utils';
import {
  stripFileFields,
  extractMeta,
  uploadAllFiles,
  resolveCountryIsoCode,
  resolveStateCode,
  type UploadItem,
  type UploadedDocument,
} from '@/utils/rwa.utils';
import { useGroups, useJoinedGroups, useJoinGroup } from '@/api/group.api';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAssetForm, type IUploadedDoc } from '@/hooks/useAssetForm';
import { initailState } from '@/components/CommunityOfHouse/initialAssetFormState';
import StatusModal from '@/components/Modals/Status';
import CommonModal from '@/components/CommonModal';
import RwaAssetForm from '@/components/Form/RwaAssetForm';
import RwaForm from '@/components/Form/RwaForm';
import {
  assetGroup1,
  assetGroup2,
  assetGroup3,
  assetGroup4,
  ownershipFields,
  OwnershipDocFields,
  valuationFields,
  ValuationDocFields,
  RWA_DOCUMENT_TYPE_CODE_MAP,
} from '@/constants/rwa';
import {
  AaInput,
  AaMobileInput,
  AaSearchableSelect,
  AaSelect,
  AaTextArea,
} from '@/components/Dashboard/Overview/AssetOwner/tabs/addAssetFormFields';

const RWA_PROGRESS_KEY = 'add_asset_rwa_progress';

const formatDocType = (type: string) =>
  type
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

const getPreviewKind = (url: string): 'image' | 'video' | 'pdf' | 'other' => {
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  return 'other';
};

interface SourcingAddAssetProps {
  aaIndex: number;
  setAaIndex: (index: number) => void;
  showConfirm: (title: string, text: string, onConfirm: () => void) => void;
}

export default function SourcingAddAsset({
  aaIndex,
  setAaIndex,
  showConfirm,
}: SourcingAddAssetProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const assetIdParam = searchParams.get('id') || undefined;
  const groupIdParam = Number(searchParams.get('groupId')) || 0;

  // Primary Club picker for Step 1 — multi-select (max 5) so the user can
  // pick/join several clubs at once. The first selected club is the
  // asset's actual "primary" group sent to the create-asset payload; the
  // others are just batch-joined as a convenience. Pre-selected from the
  // URL's groupId when present (e.g. via "Share Your Asset").
  const MAX_GROUPS = 5;
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    groupIdParam ? [String(groupIdParam)] : []
  );
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.authLogin
  );
  const accountId = user?.id;
  const { data: joinedGroups } = useJoinedGroups(accountId, isAuthenticated);
  const { mutate: joinGroup, isPending: isJoiningGroup } = useJoinGroup();

  const { data: groupsRes } = useGroups();
  const groupOptions =
    groupsRes?.data.map((g) => ({
      label: g.title,
      value: String(g.id),
    })) ?? [];
  const filteredGroupOptions = groupOptions.filter((o) =>
    o.label.toLowerCase().includes(groupSearch.toLowerCase())
  );

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(e.target as Node)
      ) {
        setGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleGroupSelection = (id: string) => {
    setSelectedGroupIds((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id);
      if (prev.length >= MAX_GROUPS) return prev;
      return [...prev, id];
    });
    handleChange({ target: { name: 'groupId', value: id } });
  };

  const removeGroupSelection = (id: string) => {
    setSelectedGroupIds((prev) => prev.filter((g) => g !== id));
  };

  // Selected clubs the account hasn't joined yet — drives the "Join
  // Club" / "Join All Club" prompt below the multi-select.
  const unjoinedSelectedIds = selectedGroupIds.filter(
    (id) => !joinedGroups?.find((g) => String(g.id) === id)?.isJoined
  );
  const [groupJoinRequiredError, setGroupJoinRequiredError] = useState('');
  useEffect(() => {
    if (unjoinedSelectedIds.length === 0) setGroupJoinRequiredError('');
  }, [unjoinedSelectedIds.length]);

  const handleJoinGroups = (ids: string[]) => {
    if (ids.length === 0) return;
    setJoiningGroupId(ids.length === 1 ? ids[0] : 'all');
    const payload = ids.length === 1 ? Number(ids[0]) : ids.map(Number);
    joinGroup(payload, {
      onSuccess: () => {
        setJoiningGroupId(null);
        setStatusModal({
          open: true,
          status: 'success',
          title: 'Success',
          message:
            ids.length === 1
              ? 'Joined primary club successfully.'
              : `Joined ${ids.length} primary clubs successfully.`,
        });
      },
      onError: (err: any) => {
        setJoiningGroupId(null);
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: err?.message || 'Failed to join group.',
        });
      },
    });
  };

  const {
    data: assetRes,
    isLoading: isAssetLoading,
    refetch: refetchAsset,
  } = useAssetById(assetIdParam);
  const fetchedAsset = assetRes?.success ? assetRes.data : undefined;
  const status = fetchedAsset?.status;
  const hasCompletedInvite = !!fetchedAsset?.assetOwner?.email;

  const {
    previewImages,
    uploadedDocs,
    handleFileChange,
    removeImage,
    imageError,
    setPreviewImages,
    setImages,
    setUploadedDocs,
    handleDrop,
    isDragging,
    setIsDragging,
    isUploading,
  } = useImageUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Asset Video — optional, same upload mechanism as images (Step 1
  // "Preliminary"), kept separate from useImageUpload so the "min 5
  // images" validation isn't affected by video count.
  const MAX_VIDEOS = 5;
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [previewVideos, setPreviewVideos] = useState<string[]>([]);
  const [uploadedVideoDocs, setUploadedVideoDocs] = useState<IUploadedDoc[]>(
    []
  );
  const [videoError, setVideoError] = useState('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    setVideoError('');
    if (videoFiles.length + fileArray.length > MAX_VIDEOS) {
      setVideoError(`Max ${MAX_VIDEOS} videos`);
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    const previews = fileArray.map((f) => URL.createObjectURL(f));
    setVideoFiles((prev) => [...prev, ...fileArray]);
    setPreviewVideos((prev) => [...prev, ...previews]);

    setIsVideoUploading(true);
    try {
      const uploaded = await Promise.all(
        fileArray.map(async (file) => {
          const res = await uploadFileApi(file);
          return {
            documentType: 'ASSET_VIDEO',
            documentName: file.name,
            documentUrl: res.success ? (res.data?.url ?? '') : '',
            remarks: '',
          };
        })
      );
      setUploadedVideoDocs((prev) => [...prev, ...uploaded]);
    } catch {
      setVideoError('Upload failed');
    } finally {
      setIsVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const removeVideo = (index: number) => {
    // previewVideos/uploadedVideoDocs can be longer than videoFiles when
    // existing (already-uploaded) videos were prefilled without a matching
    // File — map the removed index onto the newly-added File, if any.
    const existingCount = previewVideos.length - videoFiles.length;
    const fileIndex = index - existingCount;

    if (fileIndex >= 0) {
      setVideoFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    setPreviewVideos((prev) => {
      URL.revokeObjectURL(prev[index]); // memory cleanup (no-op for non-blob URLs)
      return prev.filter((_, i) => i !== index);
    });
    setUploadedVideoDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // Memoized — useAssetForm uses this as a useEffect dependency. A fresh
  // array literal here on every render meant this effect fired every
  // render (see AddAssetTab.tsx for the "Maximum update depth exceeded"
  // history behind this).
  const allUploadedDocs = useMemo(
    () => [...uploadedDocs, ...uploadedVideoDocs],
    [uploadedDocs, uploadedVideoDocs]
  );

  // Step 1 draft's "extra" pieces — images/videos/selected clubs don't live
  // in useAssetForm's formData, so Save Draft/restore-on-mount need these
  // read/write hooks passed through explicitly.
  const getDraftExtra = () => ({
    uploadedDocs,
    uploadedVideoDocs,
    selectedGroupIds,
  });

  const onRestoreDraftExtra = (extra: Record<string, unknown>) => {
    const docs = (extra.uploadedDocs as IUploadedDoc[] | undefined) ?? [];
    const videoDocs =
      (extra.uploadedVideoDocs as IUploadedDoc[] | undefined) ?? [];
    const groupIdsExtra =
      (extra.selectedGroupIds as string[] | undefined) ?? [];

    if (videoDocs.length) {
      setUploadedVideoDocs(videoDocs);
      setPreviewVideos(videoDocs.map((d) => d.documentUrl));
    }

    if (docs.length) {
      setUploadedDocs(docs);
      setPreviewImages(docs.map((d) => d.documentUrl));
    }
    if (groupIdsExtra.length) {
      setSelectedGroupIds(groupIdsExtra);
    }
  };

  const {
    formData,
    errors,
    handleChange,
    handleBlur,
    handleSubmit: submitAssetForm,
    statusModal,
    setStatusModal,
    setFormData,
    loading: submittingAsset,
    saveDraft,
    clearDraft,
  } = useAssetForm(
    initailState,
    allUploadedDocs,
    selectedGroupIds.map(Number),
    () => {},
    setPreviewImages,
    setImages,
    () => {
      refetchAsset();
      setAaIndex(2);
    },
    assetIdParam,
    fetchedAsset?.documents?.map((d) => d.documentUrl),
    getDraftExtra,
    onRestoreDraftExtra
  );

  const ownershipModelOptions = [
    ...OwnerMode,
    { label: 'Others', value: 'Others' },
  ];
  const onlyLettersAndSpaces = /^[A-Za-z\s]*$/;

  const didInitFromAsset = useRef(false);
  useEffect(() => {
    if (!fetchedAsset || didInitFromAsset.current) return;
    didInitFromAsset.current = true;

    const getMeta = (key: string) =>
      fetchedAsset.meta?.find((m) => m.metaKey === key)?.metaValue ?? '';

    setFormData({
      assetType: fetchedAsset.assetType || '',
      assetSubType: getMeta('assetSubType') || fetchedAsset.assetSubType || '',
      assetTitle: fetchedAsset.assetTitle || '',
      shortDescription: getMeta('shortDescription'),
      ownershipModel: fetchedAsset.ownershipModel || '',
      ownershipModelOther: fetchedAsset.ownershipModelOther || '',
      country: getMeta('country'),
      state: getMeta('state'),
      city: getMeta('city'),
      pincode: getMeta('pincode'),
      mapUrl: getMeta('mapUrl'),
      marketValue: getMeta('marketValue'),
      landArea: getMeta('landArea'),
      name: fetchedAsset.assetOwner?.name || '',
      email: fetchedAsset.assetOwner?.email || '',
      mobile: fetchedAsset.assetOwner?.mobile || '',
    });

    if (fetchedAsset.tempGroupIds?.length) {
      setSelectedGroupIds(fetchedAsset.tempGroupIds.map(String));
    }

    const existingImageDocs = (fetchedAsset.documents || [])
      .filter((d) => d.documentType === 'ASSET_IMAGE')
      .map((d) => ({
        documentType: d.documentType,
        documentName: d.documentName,
        documentUrl: d.url,
        remarks: '',
      }));
    if (existingImageDocs.length) {
      setPreviewImages(existingImageDocs.map((d) => d.documentUrl));
      setUploadedDocs(existingImageDocs);
    }

    const existingVideoDocs = (fetchedAsset.documents || [])
      .filter((d) => d.documentType === 'ASSET_VIDEO')
      .map((d) => ({
        documentType: d.documentType,
        documentName: d.documentName,
        documentUrl: d.url,
        remarks: '',
      }));
    if (existingVideoDocs.length) {
      setPreviewVideos(existingVideoDocs.map((d) => d.documentUrl));
      setUploadedVideoDocs(existingVideoDocs);
    }

    const stepParam = searchParams.get('step');
    if (stepParam) {
      const spVal = parseInt(stepParam, 10);
      if (!isNaN(spVal)) {
        if (!hasCompletedInvite && spVal >= 4) {
          setAaIndex(3);
          setRwaSubStep(4);
        } else {
          setAaIndex(spVal);
        }
      }
      return;
    }

    if (fetchedAsset.status === 'Rejected') {
      setAaIndex(1);
    } else {
      const stepsNum = fetchedAsset.steps
        ? parseInt(fetchedAsset.steps, 10)
        : NaN;
      let targetStep = !isNaN(stepsNum) && stepsNum > 0 ? stepsNum : 2;
      if (!hasCompletedInvite && targetStep >= 4) {
        targetStep = 3;
        setRwaSubStep(4);
      }
      setAaIndex(targetStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedAsset]);

  const getFetchedMeta = (key: string) =>
    fetchedAsset?.meta?.find((m) => m.metaKey === key)?.metaValue ?? '';

  const fetchedStepsNum = fetchedAsset?.steps
    ? parseInt(fetchedAsset.steps, 10)
    : NaN;
  const isDueDiligenceRejected =
    fetchedAsset?.rwaRequest?.statusForDueDiligence === 'DueDiligenceRejected';
  const isDueDiligenceApproved =
    fetchedAsset?.rwaRequest?.statusForDueDiligence === 'DueDiligence';
  const valuationStatus = fetchedAsset?.rwaRequest?.statusForValuation;
  // "Submitted" means this stage was reset for re-review — it must show as
  // In Progress even if a later stage (Due Diligence) is still showing its
  // previous approved/rejected outcome from before the resubmission.
  const isValuationReviewApproved =
    valuationStatus !== 'Submitted' &&
    (valuationStatus === 'ValuationReviewed' ||
      isDueDiligenceApproved ||
      isDueDiligenceRejected);
  const isValuationReviewRejected = valuationStatus === 'ValuationRejected';
  const legalStatus = fetchedAsset?.rwaRequest?.statusForLegal;
  const isLegalReviewApproved =
    legalStatus !== 'Submitted' &&
    (legalStatus === 'LegalReviewed' ||
      isValuationReviewApproved ||
      isValuationReviewRejected);
  const isLegalReviewRejected = legalStatus === 'LegalRejected';
  // Any of the three review stages being rejected should route back to the
  // editable form — previously this required All three to be rejected at
  // once, so a single rejected stage (e.g. only statusForValuation) never
  // triggered it.
  const isRwaRejected =
    isLegalReviewRejected ||
    isValuationReviewRejected ||
    isDueDiligenceRejected;

  const showFullAssetView =
    (fetchedAsset?.status === 'Reviewed' ||
      fetchedAsset?.status === 'RequestLive') &&
    !isNaN(fetchedStepsNum) &&
    fetchedStepsNum >= 5 &&
    !isRwaRejected &&
    hasCompletedInvite;
  const isListingRequestPending = fetchedAsset?.status === 'RequestLive';
  const isListingLive = fetchedAsset?.status === 'Available';

  // STEP 3 is an internal 3-part flow (same as /dashboard/rwa/rwa-form):
  // 1. Property/Media details (RwaAssetForm)  2. Ownership (RwaForm)  3. Valuation (RwaForm)
  const [rwaSubStep, setRwaSubStep] = useState<1 | 2 | 3 | 4>(1);
  const [rwaStep1Data, setRwaStep1Data] = useState<FieldValues>({});
  const [rwaStep1Docs, setRwaStep1Docs] = useState<UploadedDocument[]>([]);
  const [rwaStep2Data, setRwaStep2Data] = useState<FieldValues>({});
  const [rwaStep2Docs, setRwaStep2Docs] = useState<UploadedDocument[]>([]);
  const [rwaSubmitting, setRwaSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    name: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [rwaSubStep]);

  // Persist Step 3's in-progress sub-steps to localStorage so a refresh
  // doesn't lose completed Property/Ownership data (same as /dashboard/rwa/rwa-form).
  const didRestoreRwaProgress = useRef(false);
  useEffect(() => {
    if (!assetIdParam || didRestoreRwaProgress.current) return;
    didRestoreRwaProgress.current = true;
    try {
      const raw = localStorage.getItem(RWA_PROGRESS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (String(parsed.assetId) !== String(assetIdParam)) {
        localStorage.removeItem(RWA_PROGRESS_KEY);
        return;
      }
      if (parsed.rwaSubStep) setRwaSubStep(parsed.rwaSubStep);
      if (parsed.rwaStep1Data) setRwaStep1Data(parsed.rwaStep1Data);
      if (parsed.rwaStep1Docs) setRwaStep1Docs(parsed.rwaStep1Docs);
      if (parsed.rwaStep2Data) setRwaStep2Data(parsed.rwaStep2Data);
      if (parsed.rwaStep2Docs) setRwaStep2Docs(parsed.rwaStep2Docs);
    } catch {
      localStorage.removeItem(RWA_PROGRESS_KEY);
    }
  }, [assetIdParam]);

  useEffect(() => {
    if (!assetIdParam) return;
    // Nothing completed yet — don't write an empty placeholder.
    if (rwaSubStep === 1 && rwaStep1Docs.length === 0) return;
    try {
      localStorage.setItem(
        RWA_PROGRESS_KEY,
        JSON.stringify({
          assetId: assetIdParam,
          rwaSubStep,
          rwaStep1Data,
          rwaStep1Docs,
          rwaStep2Data,
          rwaStep2Docs,
        })
      );
    } catch {
      // ignore storage errors (e.g. quota exceeded, private mode)
    }
  }, [
    assetIdParam,
    rwaSubStep,
    rwaStep1Data,
    rwaStep1Docs,
    rwaStep2Data,
    rwaStep2Docs,
  ]);

  const rwaStep1InitialValues = fetchedAsset
    ? {
        assetType: fetchedAsset.assetType || '',
        assetSubType:
          getFetchedMeta('assetSubType') || fetchedAsset.assetSubType || '',
        assetTitle: fetchedAsset.assetTitle || '',
        shortDescription: getFetchedMeta('shortDescription'),
        detailedDescription: getFetchedMeta('detailedDescription'),
        country: getFetchedMeta('country'),
        state: getFetchedMeta('state'),
        city: getFetchedMeta('city'),
        pincode: getFetchedMeta('pincode'),
        mapUrl: getFetchedMeta('mapUrl') || fetchedAsset.mapUrl || '',
        geoLocation: getFetchedMeta('geoLocation'),
        assetImages: (fetchedAsset.documents || [])
          .filter((d) => d.documentType === 'ASSET_IMAGE')
          .map((d) => d.documentUrl.split('/').pop() ?? ''),
        assetVideos: (fetchedAsset.documents || [])
          .filter((d) => d.documentType === 'ASSET_VIDEO')
          .map((d) => d.documentUrl.split('/').pop() ?? ''),
        ...((fetchedAsset.propertyInterest?.length ?? 0) > 0
          ? {
              // The backend appends propertyInterest rather than replacing
              // it on resubmit, so it can hold more than 4 entries — only
              // the first 4 are ever shown/editable here.
              whyInvested: fetchedAsset.propertyInterest
                .slice(0, 4)
                .map((p) => ({
                  // The icon select's options are keyed by icon id (see
                  // iconOptions in RwaAssetForm), not the icon's image URL —
                  // use iconId so a previously-submitted icon shows selected.
                  icon:
                    p.iconId !== undefined && p.iconId !== null
                      ? String(p.iconId)
                      : '',
                  title: p.title || '',
                  description: p.description || '',
                })),
            }
          : {}),
      }
    : {};

  // The 3-part RWA flow only POSTs everything to the server on the final
  // (step 3) submit — steps 1 & 2's "Continue" just stash the filled values
  // in rwaStep1Data/rwaStep2Data locally. So `fetchedAsset` alone never
  // reflects what was just typed, and navigating back to an earlier
  // sub-step showed it blank/stale. Overlay the local in-progress state on
  // top of the fetched defaults so Back always shows the latest values.
  const rwaStep1InitialValuesWithProgress = {
    ...rwaStep1InitialValues,
    ...rwaStep1Data,
    ...(rwaStep1Docs.length
      ? {
          assetImages: rwaStep1Docs
            .filter((d) => d.documentType === 'ASSET_IMAGE')
            .map((d) => d.documentUrl.split('/').pop() ?? ''),
          assetVideos: rwaStep1Docs
            .filter((d) => d.documentType === 'ASSET_VIDEO')
            .map((d) => d.documentUrl.split('/').pop() ?? ''),
        }
      : {}),
  };

  const rwaStep2InitialValues = fetchedAsset
    ? {
        ownershipModel: fetchedAsset.ownershipModel || '',
        currentOwnerName: fetchedAsset.currentOwnerName || '',
        // ownershipEntityType: getFetchedMeta('ownershipEntityType'),
        encumbranceDetails: getFetchedMeta('encumbranceDetails'),
        propertySurveyKhasraNumber: getFetchedMeta(
          'propertySurveyKhasraNumber'
        ),
        titleStatus: getFetchedMeta('titleStatus'),
        reraRegistrationNumber: getFetchedMeta('reraRegistrationNumber'),
        landArea: getFetchedMeta('landArea'),
        builtupArea: getFetchedMeta('builtupArea'),
        yearOfConstruction: getFetchedMeta('yearOfConstruction'),
        assetAge: getFetchedMeta('assetAge'),
        // NOC radio selection — without this the "Please select NOC type"
        // validation blocks Continue even though the NOC document itself
        // is already uploaded and prefilled.
        noc: getFetchedMeta('noc'),
      }
    : {};

  const rwaStep2InitialValuesWithProgress = {
    ...rwaStep2InitialValues,
    ...rwaStep2Data,
  };

  const rwaStep2InitialDocumentsWithProgress = rwaStep2Docs.length
    ? rwaStep2Docs
    : fetchedAsset?.documents;

  const rwaStep3InitialValues = fetchedAsset
    ? {
        marketValue: getFetchedMeta('marketValue'),
        currency: getFetchedMeta('currency'),
        valuationAgencyName: getFetchedMeta('valuationAgencyName'),
        valuationReportDate: getFetchedMeta('valuationReportDate'),
        lastPurchasePrice: getFetchedMeta('lastPurchasePrice'),
        rentalIncomeMonthly: getFetchedMeta('rentalIncomeMonthly'),
        leaseTenureRemainingMonths: getFetchedMeta(
          'leaseTenureRemainingMonths'
        ),
        last3YearRevenue: getFetchedMeta('last3YearRevenue'),
        operationalExpensesAnnual: getFetchedMeta('operationalExpensesAnnual'),
        netOperationalIncome: getFetchedMeta('netOperationalIncome'),
        expectedYieldPercentage: getFetchedMeta('expectedYieldPercentage'),
        expectedAppreciationPercentage: getFetchedMeta(
          'expectedAppreciationPercentage'
        ),
        // Financials radio selection — without this the "Please select a
        // Financials document type" validation blocks Continue even though
        // the Financials document itself is already uploaded and prefilled.
        financials: getFetchedMeta('financials'),
      }
    : {};

  const mapApiToStep4 = (data: any) => {
    const owner = data?.assetOwner || {};
    const fullName = owner.name || '';
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');

    return {
      ownerFirstName: firstName || '',
      ownerLastName: lastName || '',
      ownerEmail: owner.email || '',
      ownerMobile: owner.mobile || '',
      proposedCommissionPct: data?.proposedCommissionPct || '',
      brokerNote: data?.brokerNote || '',
    };
  };

  const rwaStep4InitialValues = fetchedAsset ? mapApiToStep4(fetchedAsset) : {};

  interface AssetMediaFormItem {
    file: File | null;
    filename?: string;
  }

  const handleRwaStep1Submit = async (data: FieldValues) => {
    setRwaSubmitting(true);
    try {
      const { assetImages, assetVideos, ...rest } = data;
      const imageItems = (assetImages ?? []) as AssetMediaFormItem[];
      const videoItems = (assetVideos ?? []) as AssetMediaFormItem[];

      const existingImageFilenames = imageItems
        .filter((f) => !f.file && f.filename)
        .map((f) => f.filename);
      const existingVideoFilenames = videoItems
        .filter((f) => !f.file && f.filename)
        .map((f) => f.filename);

      const uploadItems: UploadItem[] = [];
      imageItems.forEach((f, index) => {
        if (f.file instanceof File) {
          uploadItems.push({
            file: f.file,
            documentType: 'ASSET_IMAGE',
            documentName: f.file.name || `Asset Image ${index + 1}`,
          });
        }
      });
      videoItems.forEach((f, index) => {
        if (f.file instanceof File) {
          uploadItems.push({
            file: f.file,
            documentType: 'ASSET_VIDEO',
            documentName: f.file.name || `Asset Video ${index + 1}`,
          });
        }
      });

      const uploaded = uploadItems.length
        ? await uploadAllFiles(uploadItems)
        : [];

      const keptDocs = (fetchedAsset?.documents || [])
        .filter((d) => {
          const fname = d.documentUrl.split('/').pop() ?? '';
          return (
            (d.documentType === 'ASSET_IMAGE' &&
              existingImageFilenames.includes(fname)) ||
            (d.documentType === 'ASSET_VIDEO' &&
              existingVideoFilenames.includes(fname))
          );
        })
        .map((d) => ({
          documentType: d.documentType,
          documentName: d.documentName,
          documentUrl: d.documentUrl,
          remarks: '',
        }));

      setRwaStep1Data(stripFileFields(rest));
      setRwaStep1Docs([...keptDocs, ...uploaded]);
      setRwaSubStep(2);
    } catch {
      toast.error('Something went wrong while uploading files.');
    } finally {
      setRwaSubmitting(false);
    }
  };

  const handleRwaStep2Submit = async ({
    documents,
    ...values
  }: FieldValues) => {
    const cleaned = stripFileFields(values);
    setRwaStep2Data(cleaned);

    const mappedDocs = (documents || []).map(
      (d: { developerName: string; filename: string }) => ({
        documentType:
          RWA_DOCUMENT_TYPE_CODE_MAP[d.developerName] || d.developerName,
        documentName: d.developerName,
        documentUrl: d.filename,
        remarks: '',
      })
    );
    setRwaStep2Docs(mappedDocs);
    setRwaSubStep(3);
  };

  const handleRwaStep3Submit = async ({
    documents,
    ...values
  }: FieldValues) => {
    if (!assetIdParam) {
      toast.error('Asset not found — please complete Step 1 first.');
      return;
    }
    setRwaSubmitting(true);
    try {
      const cleaned = stripFileFields(values);
      const mappedDocs = (documents || []).map(
        (d: { developerName: string; filename: string }) => ({
          documentType:
            RWA_DOCUMENT_TYPE_CODE_MAP[d.developerName] || d.developerName,
          documentName: d.developerName,
          documentUrl: d.filename,
          remarks: '',
        })
      );

      const basicInfo = {
        assetType: rwaStep1Data.assetType || formData.assetType,
        assetTitle: rwaStep1Data.assetTitle || formData.assetTitle,
        currentOwnerName: rwaStep2Data.currentOwnerName || formData.name,
        ownershipModel: rwaStep2Data.ownershipModel || formData.ownershipModel,
      };
      const meta = extractMeta(rwaStep1Data, rwaStep2Data, cleaned, undefined);

      // The backend appends whatever `documents` we send rather than
      // replacing/deduping — only send docs that aren't already on the
      // asset, otherwise already-uploaded images/videos get duplicated.
      const existingDocUrls = new Set(
        (fetchedAsset?.documents || []).map((d) => d.documentUrl)
      );
      const newDocsOnly = [
        ...rwaStep1Docs,
        ...rwaStep2Docs,
        ...mappedDocs,
      ].filter((d) => !existingDocUrls.has(d.documentUrl));

      // The backend appends propertyInterest rather than replacing it too —
      // resending the same 4 entries on every resubmit keeps duplicating
      // them. Only send `whyInvested` when it actually differs from what's
      // already saved on the asset.
      const currentWhyInvested = (
        (rwaStep1Data.whyInvested || []) as {
          icon: string;
          title: string;
          description: string;
        }[]
      ).filter((entry) => entry?.icon || entry?.title || entry?.description);
      const savedWhyInvested = (fetchedAsset?.propertyInterest || [])
        .slice(0, 4)
        .map((p) => ({
          icon:
            p.iconId !== undefined && p.iconId !== null ? String(p.iconId) : '',
          title: p.title || '',
          description: p.description || '',
        }));
      const whyInvestedChanged =
        JSON.stringify(currentWhyInvested) !== JSON.stringify(savedWhyInvested);

      // Whichever review stage(s) are currently rejected are the ones this
      // resubmission is addressing — always send their statusFor* field as
      // "Submitted" so the backend re-queues exactly that review, regardless
      // of how the user navigated back to this form.
      const payload = {
        basicInfo,
        ...(isLegalReviewRejected ? { statusForLegal: 'Submitted' } : {}),
        ...(isValuationReviewRejected
          ? { statusForValuation: 'Submitted' }
          : {}),
        ...(isDueDiligenceRejected
          ? { statusForDueDiligence: 'Submitted' }
          : {}),
        meta,
        documents: newDocsOnly,
        ...(whyInvestedChanged ? { whyInvested: currentWhyInvested } : {}),
      };

      const res = await updateStepsAssetApi(assetIdParam, payload);

      if (!res?.success) {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: res?.message || 'Failed to save full asset details',
        });
        return;
      }

      setStatusModal({
        open: true,
        status: 'success',
        title: 'Success',
        message: 'Full asset details saved.',
      });
      localStorage.removeItem(RWA_PROGRESS_KEY);
      await refetchAsset();
      setRwaSubStep(4);
    } catch {
      setStatusModal({
        open: true,
        status: 'error',
        message: 'Something went wrong',
      });
    } finally {
      setRwaSubmitting(false);
    }
  };

  const handleRwaStep4Submit = async (formData: any) => {
    if (!assetIdParam) {
      toast.error('Asset not found — please complete Step 1 first.');
      return;
    }
    setRwaSubmitting(true);
    try {
      const payload = {
        assetId: Number(assetIdParam),
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

      setStatusModal({
        open: true,
        status: 'success',
        title: 'Broker Invite Sent',
        message:
          'Your broker invite and asset details have been successfully submitted.',
      });

      localStorage.removeItem(RWA_PROGRESS_KEY);
      await refetchAsset();
      setAaIndex(4);
    } catch (err: any) {
      console.error(err);
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Broker Invite Failed',
        message: err?.message || 'Something went wrong while inviting broker.',
      });
    } finally {
      setRwaSubmitting(false);
    }
  };

  const { data: countriesRes } = useCountries();

  // Older submits stored the human-readable country/state name in asset
  // meta instead of the select's isoCode/code. Resolve formData.country /
  // formData.state to a real code *before* calling the states/cities APIs,
  // so a raw name like "India" never goes out as countryCode. Until the
  // countries/states list has loaded (so we can actually resolve it), keep
  // the code empty rather than falling back to the raw value — otherwise
  // the states/cities query fires once with the raw name and again with
  // the resolved code.
  const resolvedStep1CountryCode =
    countriesRes?.success === true
      ? (resolveCountryIsoCode(countriesRes.data, formData.country) ??
        formData.country)
      : '';

  const { data: statesRes } = useStates(resolvedStep1CountryCode);

  const resolvedStep1StateCode =
    statesRes?.success === true
      ? (resolveStateCode(statesRes.data, formData.state) ?? formData.state)
      : '';

  const { data: citiesRes } = useCities(
    resolvedStep1CountryCode,
    resolvedStep1StateCode
  );

  // Reflect the resolved codes back into formData once (the Country/State
  // selects read formData.country/state directly), so they show the
  // correct selection instead of the raw stored name. Wait for the asset
  // fetch to actually finish before treating an empty country/state as
  // final — formData starts blank while the asset is still loading.
  const didResolveStep1Country = useRef(false);
  useEffect(() => {
    if (didResolveStep1Country.current) return;
    if (assetIdParam && !fetchedAsset) return;
    if (!formData.country) {
      didResolveStep1Country.current = true;
      return;
    }
    if (countriesRes?.success !== true) return;
    didResolveStep1Country.current = true;
    if (
      resolvedStep1CountryCode &&
      resolvedStep1CountryCode !== formData.country
    ) {
      setFormData((prev) => ({ ...prev, country: resolvedStep1CountryCode }));
    }
  }, [
    countriesRes,
    formData.country,
    setFormData,
    assetIdParam,
    fetchedAsset,
    resolvedStep1CountryCode,
  ]);

  const didResolveStep1State = useRef(false);
  useEffect(() => {
    if (didResolveStep1State.current) return;
    if (assetIdParam && !fetchedAsset) return;
    if (!formData.state) {
      didResolveStep1State.current = true;
      return;
    }
    if (statesRes?.success !== true) return;
    didResolveStep1State.current = true;
    if (resolvedStep1StateCode && resolvedStep1StateCode !== formData.state) {
      setFormData((prev) => ({ ...prev, state: resolvedStep1StateCode }));
    }
  }, [
    statesRes,
    formData.state,
    setFormData,
    assetIdParam,
    fetchedAsset,
    resolvedStep1StateCode,
  ]);

  const countryList =
    countriesRes?.success === true
      ? countriesRes?.data?.map((c: ICountry) => ({
          label: c.name,
          value: c.isoCode,
        }))
      : [];

  const stateList =
    statesRes?.success === true
      ? statesRes?.data?.map((s: IState) => ({
          label: s.name,
          value: s.code,
        }))
      : [];

  const cityList =
    citiesRes?.success === true
      ? citiesRes?.data?.map((c: ICity) => ({
          label: c.name,
          value: c.name,
        }))
      : [];

  const aaLabels: Record<number, string> = {
    1: 'Preliminary Information',
    2: 'Admin Review',
    3: 'Full Asset Details',
    4: 'Documents & Compliance',
    5: 'Valuation & Legal Review',
    6: 'Listing Approval',
  };

  const aaShortLabels: Record<number, string> = {
    1: 'Preliminary',
    2: 'Admin Review',
    3: 'Full Details',
    4: 'Documents',
    5: 'Valuation/Legal',
    6: 'Listing Approval',
  };

  const aaNav = (dir: number) => {
    if (dir > 0) {
      toast.success(`${aaLabels[aaIndex]} saved`);
      if (aaIndex < 6) setAaIndex(aaIndex + 1);
    } else if (dir < 0 && aaIndex > 1) {
      setAaIndex(aaIndex - 1);
    }
  };

  const confirmListingApproval = () => {
    showConfirm(
      'Approve & Submit Listing?',
      'This sends your listing draft to Admin for final approval and, once approved, makes it visible to your shared clubs. This action cannot be undone — you will need Admin to unpublish if you change your mind.',
      async () => {
        if (!assetIdParam) return;
        const res = await requestListingApi(assetIdParam);
        if (!res?.success) {
          toast.error(res?.message || 'Failed to submit listing for approval');
          return;
        }
        toast.success('Listing approved — sent to Admin for final approval');
        await refetchAsset();
      }
    );
  };

  return (
    <div className="space-y-6">
      {createPortal(
        <button
          type="button"
          onClick={() => navigate('/contact-us')}
          aria-label="Contact Us"
          className="group fixed top-[126px] right-6 z-40 flex h-[52px] items-center overflow-hidden rounded-full bg-[#1F4FE0] px-4 text-white shadow-lg shadow-[#1F4FE0]/30 transition-all duration-300 hover:pr-5 hover:shadow-xl hover:shadow-[#1F4FE0]/40 dark:shadow-black/40"
        >
          <FiHeadphones size={20} className="shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap font-12 font-semibold transition-all duration-300 group-hover:max-w-[110px] group-hover:ml-2">
            Contact Us
          </span>
        </button>,
        document.body
      )}
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Add an Asset
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Step {aaIndex} of 6 — {aaLabels[aaIndex]}
        </p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-start pb-4">
        {[1, 2, 3, 4, 5, 6].map((num, idx) => {
          const isDone = num < aaIndex;
          const isCurrent = num === aaIndex;
          return (
            <div key={num} className="relative flex-1 text-center px-0.5">
              {idx > 0 && (
                <div
                  className={`absolute top-2.5 sm:top-3 left-[-50%] w-full h-0.5 -z-10 ${
                    num <= aaIndex
                      ? 'bg-[#1F4FE0]'
                      : 'bg-gray-200 dark:bg-white/10'
                  }`}
                />
              )}
              <div
                className={`relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full mx-auto mb-1 sm:mb-1.5 flex items-center justify-center text-[10px] sm:font-12 font-bold ${
                  isCurrent
                    ? 'bg-[#0B2545] text-white dark:bg-[#1F4FE0]'
                    : isDone
                      ? 'bg-[#1F4FE0] text-white'
                      : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                }`}
              >
                {num}
              </div>
              <div
                className={`text-[8.5px] sm:text-[11px] leading-tight break-words ${
                  isCurrent || isDone
                    ? 'text-[#0B2545] dark:text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {aaShortLabels[num]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-6">
        {/* STEP 1 */}
        {aaIndex === 1 && (
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="font-12 text-gray-500 font-medium">
                Primary Clubs <span className="text-red-500">*</span>{' '}
                <span className="text-gray-400 font-normal">
                  (select up to {MAX_GROUPS})
                </span>
              </label>

              <div className="relative" ref={groupDropdownRef}>
                <div
                  onClick={() => setGroupDropdownOpen((o) => !o)}
                  className={`px-3 py-2 border rounded-lg font-12 md:font-14 flex items-center justify-between cursor-pointer transition
                    border-gray-300 dark:border-white/10
                    ${groupDropdownOpen ? 'bg-white dark:bg-[#132436] border-[#1F4FE0]' : 'bg-gray-50 dark:bg-white/5'}
                  `}
                >
                  <span
                    className={
                      selectedGroupIds.length
                        ? 'text-gray-800 dark:text-white font-medium'
                        : 'text-gray-400 dark:text-gray-500'
                    }
                  >
                    {selectedGroupIds.length
                      ? `${selectedGroupIds.length} club${selectedGroupIds.length > 1 ? 's' : ''} selected`
                      : 'Select Primary Club(s)'}
                  </span>
                  <FiChevronDown
                    className={`text-gray-500 dark:text-gray-300 transition-transform shrink-0 ${
                      groupDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {groupDropdownOpen && (
                  <div className="absolute z-[999] w-full mt-1 bg-white dark:bg-[#132436] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-white/10">
                      <input
                        autoFocus
                        type="text"
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                        placeholder="Search club..."
                        className="w-full bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white text-sm px-3 py-2 rounded-md outline-none border border-gray-200 dark:border-white/10 focus:border-[#1F4FE0] placeholder:text-gray-400"
                      />
                    </div>
                    <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 scrollbar-ui">
                      {filteredGroupOptions.length === 0 ? (
                        <li className="px-3 py-2 text-gray-400 text-sm text-center">
                          No clubs found
                        </li>
                      ) : (
                        filteredGroupOptions.map((o) => {
                          const isSelected = selectedGroupIds.includes(o.value);
                          const limitReached =
                            !isSelected &&
                            selectedGroupIds.length >= MAX_GROUPS;
                          return (
                            <li
                              key={o.value}
                              onClick={() =>
                                !limitReached && toggleGroupSelection(o.value)
                              }
                              className={`px-3 py-2 text-sm text-start flex items-center justify-between gap-2 transition
                                ${
                                  limitReached
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/40 dark:text-blue-300 font-semibold cursor-pointer'
                                      : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer'
                                }
                              `}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={limitReached}
                                  readOnly
                                  className="h-3.5 w-3.5 accent-[#1F4FE0] cursor-pointer shrink-0"
                                />
                                <span className="truncate">{o.label}</span>
                              </span>
                              {isSelected && <FiCheck size={14} />}
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {errors.groupId && (
                <p className="text-red-500 text-[11px] mt-0.5">
                  {errors.groupId}
                </p>
              )}
            </div>

            {selectedGroupIds.length > 0 && (
              <div className="flex flex-col gap-2 -mt-3">
                {selectedGroupIds.map((id) => {
                  const group = groupOptions.find((o) => o.value === id);
                  const isJoined = joinedGroups?.find(
                    (g) => String(g.id) === id
                  )?.isJoined;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10"
                    >
                      <span className="font-12 md:font-14 text-gray-800 dark:text-white truncate">
                        {group?.label ?? id}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {isJoined ? (
                          <span className="flex items-center gap-1 font-12 font-semibold text-green-600 dark:text-green-400">
                            <FiCheck size={14} /> Joined
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleJoinGroups([id])}
                            disabled={isJoiningGroup && joiningGroupId === id}
                            className="font-12 font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isJoiningGroup && joiningGroupId === id
                              ? 'Joining…'
                              : 'Join Club'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeGroupSelection(id)}
                          title="Remove"
                          className="text-gray-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {unjoinedSelectedIds.length > 0 && (
              <p className="text-red-500 font-12 -mt-3">
                You haven&apos;t joined{' '}
                {unjoinedSelectedIds.length === 1
                  ? 'this club'
                  : `${unjoinedSelectedIds.length} of these clubs`}{' '}
                yet.{' '}
                <button
                  type="button"
                  onClick={() => handleJoinGroups(unjoinedSelectedIds)}
                  disabled={isJoiningGroup}
                  className="font-semibold underline hover:opacity-80 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isJoiningGroup && joiningGroupId
                    ? 'Joining…'
                    : unjoinedSelectedIds.length === 1
                      ? 'Join Club'
                      : 'Join All Club'}
                </button>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AaSelect
                label="Asset Type"
                name="assetType"
                value={formData.assetType}
                options={AssetTypes}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.assetType}
              />
              <AaSelect
                label="Asset Sub Type"
                name="assetSubType"
                value={formData.assetSubType}
                options={AssetSubTypes}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.assetSubType}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.ownershipModel === 'Others' ? (
                <div className="flex flex-col gap-2">
                  <label className="font-12 text-gray-500 font-medium">
                    Ownership Model <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      autoFocus
                      type="text"
                      name="ownershipModelOther"
                      autoComplete="off"
                      value={formData.ownershipModelOther}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!onlyLettersAndSpaces.test(raw)) return;
                        handleChange({
                          target: { name: 'ownershipModelOther', value: raw },
                        });
                      }}
                      onBlur={handleBlur}
                      placeholder="Enter ownership model"
                      className="w-full px-3 py-2 pr-9 border border-gray-300 dark:border-white/10 rounded-lg font-12 md:font-14 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-[#1F4FE0] focus:bg-white dark:focus:bg-white/10 scheme-light dark:scheme-dark"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleChange({
                          target: { name: 'ownershipModel', value: '' },
                        });
                        handleChange({
                          target: { name: 'ownershipModelOther', value: '' },
                        });
                      }}
                      aria-label="Clear custom ownership model"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                    >
                      <FiX className="size-4" />
                    </button>
                  </div>
                  {errors.ownershipModelOther && (
                    <p className="text-red-500 text-[11px] mt-0.5">
                      {errors.ownershipModelOther}
                    </p>
                  )}
                </div>
              ) : (
                <AaSelect
                  label="Ownership Model"
                  name="ownershipModel"
                  value={formData.ownershipModel}
                  options={ownershipModelOptions}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.ownershipModel}
                />
              )}
              <AaInput
                label="Asset Name"
                placeholder="Enter Asset Name"
                required
                type="text"
                name="assetTitle"
                value={formData.assetTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.assetTitle}
              />
            </div>
            <AaTextArea
              label="Short Description"
              placeholder="Enter Short Description"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.shortDescription}
              minLength={50}
              maxLength={250}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AaSearchableSelect
                label="Country"
                name="country"
                value={formData.country}
                options={countryList}
                placeholder="Select Country"
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    state: '',
                    city: '',
                  }));
                }}
                onBlur={handleBlur}
                error={errors.country}
              />
              {formData.country && (
                <AaSearchableSelect
                  label="State"
                  name="state"
                  value={formData.state}
                  options={stateList}
                  placeholder="Select State"
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({ ...prev, city: '' }));
                  }}
                  onBlur={handleBlur}
                  error={errors.state}
                />
              )}
            </div>
            {formData.country && formData.state && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AaSearchableSelect
                  label="City"
                  name="city"
                  value={formData.city}
                  options={cityList}
                  placeholder="Select City"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.city}
                />
                {formData.city && (
                  <AaInput
                    label="Pincode"
                    placeholder="Enter Pincode"
                    required
                    type="number"
                    name="pincode"
                    max={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.pincode}
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <AaInput
                  label="Location URL"
                  placeholder="Paste Google Maps or location link (optional)"
                  type="text"
                  name="mapUrl"
                  value={formData.mapUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.mapUrl}
                />
                {formData.mapUrl && !errors.mapUrl && (
                  <a
                    href={formData.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 font-12 font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline"
                  >
                    Check in Map ↗
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AaInput
                label="Current Market Value"
                placeholder="Enter Current Market Value"
                type="number"
                name="marketValue"
                value={formData.marketValue}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.marketValue}
                inputMode="numeric"
                required
              />
              <AaInput
                label="Area (Sq/Mtr)"
                placeholder="Enter Property Area"
                type="number"
                name="landArea"
                required
                value={formData.landArea}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.landArea}
                inputMode="numeric"
              />
            </div>

            {/* Upload Box */}
            <div>
              <p className="font-12 text-gray-500 font-medium mb-2">
                Add Images Of Property <span className="text-red-500">*</span>{' '}
                <span className="text-gray-400">(Min 5, Max 25)</span>
              </p>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isUploading) setIsDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (!isUploading) setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsDragging(false);
                  }
                }}
                onDrop={(e) => {
                  if (isUploading) {
                    e.preventDefault();
                    return;
                  }
                  handleDrop(e);
                }}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                  isDragging
                    ? 'border-[#1F4FE0] bg-[#1F4FE0]/5'
                    : 'border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1F4FE0]/50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />

                {previewImages.length === 0 ? (
                  <div className="py-6">
                    <p className="text-gray-400 text-sm mb-3">
                      Choose Photo Or Drag &amp; Drop It Here
                    </p>

                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2 font-12 text-gray-500 dark:text-gray-300">
                        <span className="w-4 h-4 border-2 border-[#1F4FE0] border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-1.5 border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white rounded-md text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition"
                      >
                        Browse Files
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {previewImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group w-20 h-20 shrink-0"
                      >
                        <img
                          src={img}
                          draggable={false}
                          className="w-full h-full object-cover select-none rounded-md"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {previewImages.length < 25 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 shrink-0 cursor-pointer border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1F4FE0]/50 flex items-center justify-center rounded-md transition"
                      >
                        <FiPlus className="text-gray-500 dark:text-white size-6" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[11px] mt-1 text-gray-400">
                {previewImages.length}/25 images selected
                {previewImages.length < 5 &&
                  ` (${5 - previewImages.length} more needed)`}
              </p>

              {(errors.images || imageError) && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.images || imageError}
                </p>
              )}
            </div>

            {/* Upload Box — Videos (optional) */}
            <div>
              <p className="font-12 text-gray-500 font-medium mb-2">
                Add Videos Of Property{' '}
                <span className="text-gray-400">(Optional, Max 5)</span>
              </p>

              <div className="border-2 border-dashed rounded-lg p-6 text-center transition border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1F4FE0]/50">
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  className="hidden"
                  ref={videoInputRef}
                  onChange={handleVideoFileChange}
                />

                {previewVideos.length === 0 ? (
                  <div className="py-6">
                    <p className="text-gray-400 text-sm mb-3">
                      Choose Video Or Browse
                    </p>

                    {isVideoUploading ? (
                      <span className="flex items-center justify-center gap-2 font-12 text-gray-500 dark:text-gray-300">
                        <span className="w-4 h-4 border-2 border-[#1F4FE0] border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isVideoUploading}
                        onClick={() => videoInputRef.current?.click()}
                        className="px-5 py-1.5 border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white rounded-md text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition"
                      >
                        Browse Files
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {previewVideos.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative group w-20 h-20 shrink-0 rounded-md overflow-hidden bg-black"
                      >
                        <video
                          src={src}
                          muted
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-cover select-none"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-lg pointer-events-none">
                          ▶
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVideo(idx);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {previewVideos.length < MAX_VIDEOS && (
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="w-20 h-20 shrink-0 cursor-pointer border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#1F4FE0]/50 flex items-center justify-center rounded-md transition"
                      >
                        <FiPlus className="text-gray-500 dark:text-white size-6" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[11px] mt-1 text-gray-400">
                {previewVideos.length}/{MAX_VIDEOS} videos selected
              </p>

              {videoError && (
                <p className="text-red-500 text-[11px] mt-1">{videoError}</p>
              )}
            </div>

            {/* Owner Details */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
              <h3 className="font-serif font-16 font-semibold text-[#0B2545] dark:text-white">
                Owner Details
              </h3>
              <div className="flex items-start gap-2 bg-[#FFF4E0] dark:bg-yellow-900/20 border border-[#F5DFAF] dark:border-yellow-900/30 rounded-xl px-4 py-3">
                <CiCircleInfo className="size-5 shrink-0 text-[#B7791F] dark:text-yellow-400 mt-0.5" />
                <p className="text-[#B7791F] dark:text-yellow-400 font-12 leading-relaxed">
                  Kindly update the owner details, if the property is not owned
                  by you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AaInput
                  label="Name"
                  placeholder="Enter Your Name"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.name}
                />
                <AaMobileInput
                  label="Mobile Number"
                  required
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.mobile}
                />
              </div>
              <AaInput
                label="Email"
                name="email"
                placeholder="Enter Your Email"
                required
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
              />
            </div>

            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed border-[#E3E7EE] dark:border-white/10 text-[11px] text-gray-400 leading-normal">
              All figures entered here are indicative inputs for internal
              review. They do not represent confirmed valuation, guaranteed
              return, or assured raise outcome. Final figures are subject to
              legal and valuation review.
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {aaIndex === 2 && (
          <div className="text-center py-8 space-y-4">
            {isAssetLoading ? (
              <p className="font-12 md:font-14 text-gray-400">
                Checking status…
              </p>
            ) : status === 'Reviewed' ? (
              <>
                <span className="px-4 py-2 rounded-full font-12 md:font-14 font-bold bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400">
                  Review Complete
                </span>
                <p className="font-12 md:font-14 text-gray-500 max-w-sm mx-auto">
                  Your preliminary information has been approved. You can now
                  continue to Full Asset Details.
                </p>
                <button
                  onClick={() => setAaIndex(3)}
                  className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition shadow-md"
                >
                  <span className="inline-flex items-center gap-1">
                    Continue to Full Asset Details <FiArrowRight size={13} />
                  </span>
                </button>
              </>
            ) : status === 'Rejected' ? (
              <>
                <span className="px-4 py-2 rounded-full font-12 md:font-14 font-bold bg-[#FBE3E0] text-[#C0392B] dark:bg-red-900/20 dark:text-red-400">
                  Rejected
                </span>
                <p className="font-12 md:font-14 text-gray-500 max-w-sm mx-auto">
                  Admin has rejected this submission. Go back to update your
                  details and resubmit for review.
                </p>
                {fetchedAsset?.rejectionReason && (
                  <p className="font-12 md:font-14 text-red-500 max-w-sm mx-auto bg-[#FBE3E0] dark:bg-red-900/20 rounded-lg px-4 py-2">
                    Reason: {fetchedAsset.rejectionReason}
                  </p>
                )}
                <button
                  onClick={() => setAaIndex(1)}
                  className="bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 px-4 py-2 rounded-lg font-12 font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition"
                >
                  Back to Edit Details
                </button>
              </>
            ) : (
              <>
                <span className="px-4 py-2 rounded-full font-12 md:font-14 font-bold bg-[#FFF4E0] text-[#B7791F] dark:bg-yellow-900/20 dark:text-yellow-400">
                  Review Pending
                </span>
                <p className="font-12 md:font-14 text-gray-500 max-w-sm mx-auto">
                  Admin checks basic details before unlocking Full Asset
                  Details. Typical turnaround: 1–2 business days.
                </p>
              </>
            )}
            <div className="pt-2">
              <button
                onClick={() => navigate('/dashboard/my-referrals')}
                className="font-12 font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline"
              >
                View Invite Investors
              </button>
            </div>
          </div>
        )}

        {aaIndex === 3 && showFullAssetView && (
          <div className="space-y-6">
            {(() => {
              const images = (fetchedAsset?.documents || []).filter(
                (d) => d.documentType === 'ASSET_IMAGE'
              );
              const videos = (fetchedAsset?.documents || []).filter(
                (d) => d.documentType === 'ASSET_VIDEO'
              );
              const stat = (label: string, value: string) => (
                <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="font-12 md:font-14 font-semibold text-gray-800 dark:text-white mt-0.5">
                    {value || '—'}
                  </p>
                </div>
              );
              return (
                <>
                  <div>
                    <h3 className="font-serif font-18 font-semibold text-[#0B2545] dark:text-white">
                      {fetchedAsset?.assetTitle}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-blue-400">
                        {formatDocType(fetchedAsset?.assetType || '')}
                      </span>
                      {fetchedAsset?.assetSubType && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                          {getFetchedMeta('assetSubType') ||
                            fetchedAsset.assetSubType}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                        {formatDocType(fetchedAsset?.ownershipModel || '')}
                      </span>
                    </div>
                  </div>

                  <p className="font-12 md:font-14 text-gray-500 dark:text-gray-400 leading-relaxed">
                    {getFetchedMeta('detailedDescription') ||
                      getFetchedMeta('shortDescription')}
                  </p>

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white">
                        Property Details
                      </h4>
                      {getFetchedMeta('mapUrl') && (
                        <a
                          href={getFetchedMeta('mapUrl')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E3E7EE] dark:border-white/10 text-[#1F4FE0] hover:bg-[#1F4FE0]/10 font-12 font-semibold transition"
                        >
                          <FiMapPin size={13} />
                          Google Location
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {stat(
                        'Short Description',
                        getFetchedMeta('shortDescription')
                      )}
                      {stat('Country', getFetchedMeta('country'))}
                      {stat('State', getFetchedMeta('state'))}
                      {stat('City', getFetchedMeta('city'))}
                      {stat('Pincode', getFetchedMeta('pincode'))}
                      {stat('Geo Location', getFetchedMeta('geoLocation'))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-2">
                      Ownership Details
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {stat(
                        'Current Owner Name',
                        fetchedAsset?.currentOwnerName || ''
                      )}
                      {/* {stat(
                        'Ownership Entity Type',
                        getFetchedMeta('ownershipEntityType')
                      )} */}
                      {stat('Title Status', getFetchedMeta('titleStatus'))}
                      {stat(
                        'Encumbrance Details',
                        getFetchedMeta('encumbranceDetails')
                      )}
                      {stat(
                        'Survey / Khasra Number',
                        getFetchedMeta('propertySurveyKhasraNumber')
                      )}
                      {stat(
                        'RERA Registration Number',
                        getFetchedMeta('reraRegistrationNumber')
                      )}
                      {stat('Land Area', getFetchedMeta('landArea'))}
                      {stat('Built-up Area', getFetchedMeta('builtupArea'))}
                      {stat('Year Built', getFetchedMeta('yearOfConstruction'))}
                      {stat('Asset Age', getFetchedMeta('assetAge'))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-2">
                      Valuation Details
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {stat(
                        'Market Value',
                        getFetchedMeta('marketValue')
                          ? `₹${Number(getFetchedMeta('marketValue')).toLocaleString('en-IN')}`
                          : ''
                      )}
                      {stat('Currency', getFetchedMeta('currency'))}
                      {stat(
                        'Valuation Agency',
                        getFetchedMeta('valuationAgencyName')
                      )}
                      {stat(
                        'Valuation Report Date',
                        getFetchedMeta('valuationReportDate')
                      )}
                      {stat(
                        'Last Purchase Price',
                        getFetchedMeta('lastPurchasePrice')
                          ? `₹${Number(getFetchedMeta('lastPurchasePrice')).toLocaleString('en-IN')}`
                          : ''
                      )}
                      {stat(
                        'Monthly Rental Income',
                        getFetchedMeta('rentalIncomeMonthly')
                          ? `₹${Number(getFetchedMeta('rentalIncomeMonthly')).toLocaleString('en-IN')}`
                          : ''
                      )}
                      {stat(
                        'Lease Tenure Remaining',
                        getFetchedMeta('leaseTenureRemainingMonths')
                          ? `${getFetchedMeta('leaseTenureRemainingMonths')} months`
                          : ''
                      )}
                      {stat(
                        'Last 3-Year Revenue',
                        getFetchedMeta('last3YearRevenue')
                          ? `₹${Number(getFetchedMeta('last3YearRevenue')).toLocaleString('en-IN')}`
                          : ''
                      )}
                      {stat(
                        'Annual Operational Expenses',
                        getFetchedMeta('operationalExpensesAnnual')
                          ? `₹${Number(getFetchedMeta('operationalExpensesAnnual')).toLocaleString('en-IN')}`
                          : ''
                      )}
                      {stat(
                        'Net Operational Income',
                        getFetchedMeta('netOperationalIncome')
                          ? `₹${Number(getFetchedMeta('netOperationalIncome')).toLocaleString('en-IN')}`
                          : ''
                      )}
                      {stat(
                        'Expected Yield',
                        getFetchedMeta('expectedYieldPercentage')
                          ? `${getFetchedMeta('expectedYieldPercentage')}%`
                          : ''
                      )}
                      {stat(
                        'Expected Appreciation',
                        getFetchedMeta('expectedAppreciationPercentage')
                          ? `${getFetchedMeta('expectedAppreciationPercentage')}%`
                          : ''
                      )}
                    </div>
                  </div>

                  {(fetchedAsset?.propertyInterest?.length ?? 0) > 0 && (
                    <div>
                      <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-2">
                        Why They Invested
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fetchedAsset?.propertyInterest.map((p, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 flex gap-3"
                          >
                            {p.icon && (
                              <img
                                src={p.icon}
                                alt=""
                                className="w-8 h-8 shrink-0 rounded object-contain"
                              />
                            )}
                            <div>
                              <p className="font-12 font-semibold text-gray-800 dark:text-white">
                                {p.title}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-3">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(images.length > 0 || videos.length > 0) && (
                    <div>
                      <h4 className="font-12 md:font-14 font-semibold text-[#0B2545] dark:text-white mb-2">
                        Property Media
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {images.map((img) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() =>
                              setPreviewDoc({
                                name: img.documentName,
                                url: img.url || img.documentUrl,
                              })
                            }
                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-white/10"
                          >
                            <img
                              src={img.url || img.documentUrl}
                              alt={img.documentName}
                              className="w-full h-full object-cover hover:scale-105 transition"
                            />
                          </button>
                        ))}
                        {videos.map((vid) => (
                          <button
                            key={vid.id}
                            type="button"
                            onClick={() =>
                              setPreviewDoc({
                                name: vid.documentName,
                                url: vid.url || vid.documentUrl,
                              })
                            }
                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-black"
                          >
                            <video
                              src={vid.url || vid.documentUrl}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xl">
                              ▶
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        if (!hasCompletedInvite) {
                          toast.error(
                            'Please complete the Owner Details form first.'
                          );
                          setRwaSubStep(4);
                          return;
                        }
                        setAaIndex(4);
                      }}
                      className="font-12 font-semibold text-[#1F4FE0] dark:text-[#60a5fa] hover:underline"
                    >
                      View All Documents →
                    </button>
                    <button
                      onClick={() => {
                        if (!hasCompletedInvite) {
                          toast.error(
                            'Please complete the Owner Details form first.'
                          );
                          setRwaSubStep(4);
                          return;
                        }
                        setAaIndex(Math.min(aaIndex + 1, 6));
                      }}
                      className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition shadow-md"
                    >
                      Next
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* STEP 3 — Full Asset Details: same 3-part form/fields/API as /dashboard/rwa/rwa-form, reskinned to match Step 1's theme */}
        {aaIndex === 3 && !showFullAssetView && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2">
              {[
                { id: 1, label: '1. Property & Media' },
                { id: 2, label: '2. Ownership' },
                { id: 3, label: '3. Valuation' },
                { id: 4, label: '4. Owner Details' },
              ].map((tab) => (
                <span
                  key={tab.id}
                  className={`px-3 py-1.5 rounded-lg font-12 font-semibold ${
                    rwaSubStep === tab.id
                      ? 'bg-[#1F4FE0] text-white'
                      : rwaSubStep > tab.id
                        ? 'bg-[#E8EEFC] text-[#1F4FE0] dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-300'
                  }`}
                >
                  {tab.label}
                </span>
              ))}
            </div>

            <div
              className="
                [&>form]:bg-transparent! [&>form]:p-0! [&>form]:rounded-none!
                [&_input]:bg-gray-50! [&_input]:dark:bg-white/5!
                [&_input]:border! [&_input]:border-gray-300! [&_input]:dark:border-white/10!
                [&_input]:rounded-lg! [&_input]:py-2! [&_input]:px-3!
                [&_input]:text-[12px]! [&_input]:font-normal! [&_input]:shadow-none!
                [&_.custom-input-phone-shell]:bg-gray-50! [&_.custom-input-phone-shell]:dark:bg-white/5!
                [&_.custom-input-phone-shell]:border! [&_.custom-input-phone-shell]:border-gray-300! [&_.custom-input-phone-shell]:dark:border-white/10!
                [&_.custom-input-phone-shell]:rounded-lg! [&_.custom-input-phone-shell]:py-2! [&_.custom-input-phone-shell]:px-3!
                [&_.custom-input-phone-shell]:text-[12px]! [&_.custom-input-phone-shell]:font-normal! [&_.custom-input-phone-shell]:shadow-none!
                [&_.custom-input-phone-shell_select]:text-[12px]! [&_.custom-input-phone-shell_input]:text-[12px]!
                [&_.custom-input-phone-shell_input]:bg-transparent! [&_.custom-input-phone-shell_input]:border-none! [&_.custom-input-phone-shell_input]:p-0!
                [&_textarea]:bg-gray-50! [&_textarea]:dark:bg-white/5!
                [&_textarea]:border! [&_textarea]:border-gray-300! [&_textarea]:dark:border-white/10!
                [&_textarea]:rounded-lg! [&_textarea]:text-[12px]! [&_textarea]:shadow-none!
                [&_label]:text-[12px]! [&_label]:font-medium! [&_label]:h-auto! [&_label]:mb-2!
                [&_label]:text-gray-500! [&_label]:dark:text-gray-400!
                [&_button.text-left]:bg-gray-50! [&_button.text-left]:dark:bg-white/5!
                [&_button.text-left]:border! [&_button.text-left]:border-gray-300! [&_button.text-left]:dark:border-white/10!
                [&_button.text-left]:rounded-lg! [&_button.text-left]:py-2! [&_button.text-left]:px-3!
                [&_button.text-left]:text-[12px]! [&_button.text-left]:font-normal! [&_button.text-left]:shadow-none!
                [&_button.text-left_span]:text-[12px]!
                [&_.bg-blue-500]:bg-[#1F4FE0]!
                [&_button.bg-transparent]:bg-white! [&_button.bg-transparent]:dark:bg-white/5!
                [&_button.bg-transparent]:border! [&_button.bg-transparent]:border-[#E3E7EE]! [&_button.bg-transparent]:dark:border-white/10!
                [&_button.bg-transparent]:text-gray-800! [&_button.bg-transparent]:dark:text-white!
                [&_button.bg-transparent]:rounded-lg! [&_button.bg-transparent]:py-2! [&_button.bg-transparent]:px-4!
                [&_button.bg-transparent]:text-[12px]! [&_button.bg-transparent]:font-semibold!
                [&_button.bg-transparent]:mt-0! [&_button.bg-transparent]:shadow-none!
                [&_button.bg-transparent]:hover:bg-gray-50! [&_button.bg-transparent]:dark:hover:bg-white/10!
                [&_button[type=submit]]:bg-[#1F4FE0]! [&_button[type=submit]]:bg-none!
                [&_button[type=submit]]:text-white! [&_button[type=submit]]:rounded-lg!
                [&_button[type=submit]]:py-2! [&_button[type=submit]]:px-4!
                [&_button[type=submit]]:text-[12px]! [&_button[type=submit]]:font-semibold!
                [&_button[type=submit]]:shadow-none! [&_button[type=submit]]:mt-0!
                [&_button[type=submit]]:hover:bg-[#153eb2]! [&_button[type=submit]]:hover:brightness-100!
                [&_button[type=submit]]:hover:shadow-md!
                [&_.justify-end]:items-center!
              "
            >
              {rwaSubStep === 1 && (
                <RwaAssetForm
                  group1={assetGroup1}
                  group2={assetGroup2}
                  group3={assetGroup3}
                  group4={assetGroup4}
                  initialValues={rwaStep1InitialValuesWithProgress}
                  onSubmit={handleRwaStep1Submit}
                  onBack={() => setAaIndex(2)}
                  isSubmitting={rwaSubmitting}
                  button={{ label: 'Continue', variant: 'primary' }}
                />
              )}
              {rwaSubStep === 2 && (
                <RwaForm
                  fields={ownershipFields}
                  docFields={OwnershipDocFields}
                  initialValues={rwaStep2InitialValuesWithProgress}
                  initialDocuments={rwaStep2InitialDocumentsWithProgress}
                  onSubmit={handleRwaStep2Submit}
                  onBack={() => setRwaSubStep(1)}
                  button={{ label: 'Continue', variant: 'primary' }}
                />
              )}
              {rwaSubStep === 3 && (
                <RwaForm
                  fields={valuationFields}
                  docFields={ValuationDocFields}
                  initialValues={rwaStep3InitialValues}
                  initialDocuments={fetchedAsset?.documents}
                  onSubmit={handleRwaStep3Submit}
                  onBack={() => setRwaSubStep(2)}
                  button={{
                    label: rwaSubmitting ? 'Submitting...' : 'Save & Continue',
                    variant: 'primary',
                  }}
                />
              )}
              {rwaSubStep === 4 && (
                <CompanyForm
                  group1={assetOnboardingGroup1}
                  group2={assetOnboardingGroup2}
                  group3={assetOnboardingGroup3}
                  group4={assetOnboardingGroup4}
                  initialValues={rwaStep4InitialValues}
                  onSubmit={handleRwaStep4Submit}
                  onBack={() => setRwaSubStep(3)}
                  button={{
                    label: rwaSubmitting ? 'Inviting...' : 'Invite Owner',
                    variant: 'primary',
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* STEP 4 — Asset Documents (excludes images/videos, shown in Step 1 & 3) */}
        {aaIndex === 4 &&
          (() => {
            const complianceDocs = (fetchedAsset?.documents || []).filter(
              (d) =>
                d.documentType !== 'ASSET_IMAGE' &&
                d.documentType !== 'ASSET_VIDEO'
            );
            return (
              <div className="space-y-3">
                {isAssetLoading ? (
                  <p className="font-12 md:font-14 text-gray-400">
                    Loading documents…
                  </p>
                ) : complianceDocs.length === 0 ? (
                  <p className="font-12 md:font-14 text-gray-400">
                    No documents uploaded yet.
                  </p>
                ) : (
                  complianceDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex justify-between items-center gap-3 py-2.5 border-b border-gray-100 dark:border-white/5 font-12 md:font-14"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 dark:text-white truncate">
                          {formatDocType(doc.documentType)}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {doc.documentName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            name: doc.documentName,
                            url: doc.url || doc.documentUrl,
                          })
                        }
                        className="shrink-0 text-[#1F4FE0] dark:text-[#60a5fa] font-semibold hover:underline"
                      >
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>
            );
          })()}

        {/* STEP 5 (was STEP 6: Valuation & Legal Review) */}
        {aaIndex === 5 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2.5 border-b border-[#E3E7EE] dark:border-white/10 font-12 md:font-14">
              <span>Legal Review</span>
              {isLegalReviewRejected ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FBE3E0] text-[#C0392B] dark:bg-red-900/20 dark:text-red-400">
                  Rejected
                </span>
              ) : isLegalReviewApproved ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400">
                  Approved
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF4E0] text-[#B7791F]">
                  In Progress
                </span>
              )}
            </div>
            {isLegalReviewRejected && (
              <div className="bg-[#FBE3E0] dark:bg-red-900/10 border border-[#F5C6C0] dark:border-red-900/20 rounded-lg p-3 space-y-2">
                {fetchedAsset?.rwaRequest?.legalRejectionReason && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#C0392B] dark:text-red-400 uppercase tracking-wide">
                      Rejection Reason
                    </p>
                    <p className="font-12 md:font-14 text-[#8C2E22] dark:text-red-300 mt-1">
                      {fetchedAsset.rwaRequest.legalRejectionReason}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setAaIndex(3)}
                  className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition shadow-md"
                >
                  Edit
                </button>
              </div>
            )}
            <div className="flex justify-between items-center py-2.5 border-b border-[#E3E7EE] dark:border-white/10 font-12 md:font-14">
              <span>Valuation Review</span>
              {isValuationReviewRejected ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FBE3E0] text-[#C0392B] dark:bg-red-900/20 dark:text-red-400">
                  Rejected
                </span>
              ) : isValuationReviewApproved ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400">
                  Approved
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF4E0] text-[#B7791F]">
                  In Progress
                </span>
              )}
            </div>
            {isValuationReviewRejected && (
              <div className="bg-[#FBE3E0] dark:bg-red-900/10 border border-[#F5C6C0] dark:border-red-900/20 rounded-lg p-3 space-y-2">
                {fetchedAsset?.rwaRequest?.valuationRejectionReason && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#C0392B] dark:text-red-400 uppercase tracking-wide">
                      Rejection Reason
                    </p>
                    <p className="font-12 md:font-14 text-[#8C2E22] dark:text-red-300 mt-1">
                      {fetchedAsset.rwaRequest.valuationRejectionReason}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setAaIndex(3)}
                  className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition shadow-md"
                >
                  Edit
                </button>
              </div>
            )}
            <div className="flex justify-between items-center py-2.5 border-b border-[#E3E7EE] dark:border-white/10 font-12 md:font-14">
              <span>Due Diligence</span>
              {isDueDiligenceRejected ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FBE3E0] text-[#C0392B] dark:bg-red-900/20 dark:text-red-400">
                  Rejected
                </span>
              ) : isDueDiligenceApproved ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400">
                  Approved
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF4E0] text-[#B7791F]">
                  In Progress
                </span>
              )}
            </div>
            {isDueDiligenceRejected && (
              <div className="bg-[#FBE3E0] dark:bg-red-900/10 border border-[#F5C6C0] dark:border-red-900/20 rounded-lg p-3 space-y-2">
                {fetchedAsset?.rwaRequest?.dueDiligenceRejectionReason && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#C0392B] dark:text-red-400 uppercase tracking-wide">
                      Rejection Reason
                    </p>
                    <p className="font-12 md:font-14 text-[#8C2E22] dark:text-red-300 mt-1">
                      {fetchedAsset.rwaRequest.dueDiligenceRejectionReason}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setAaIndex(3)}
                  className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition shadow-md"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 6 (was STEP 7: Listing Approval) */}
        {aaIndex === 6 && (
          <div className="text-center py-8 space-y-4">
            <span className="px-4 py-2 rounded-full font-12 md:font-14 font-bold bg-[#E6F4EA] text-[#0F9D58] dark:bg-green-900/20 dark:text-green-400">
              {isListingLive
                ? 'Listing Approved — Live for Investors'
                : 'Listing Draft Ready for Your Approval Request'}
            </span>
            <p className="font-12 md:font-14 text-gray-500 max-w-sm mx-auto">
              {isListingLive
                ? 'Your listing has been approved and is now live for investors to view and invest.'
                : 'Review the investor-facing listing preview before it goes live.'}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setAaIndex(3)}
                className="bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 px-4 py-2 rounded-lg font-12 font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                Preview Listing
              </button>
              {!isListingRequestPending && !isListingLive && (
                <button
                  onClick={confirmListingApproval}
                  className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition shadow-md"
                >
                  Approve &amp; Submit
                </button>
              )}
            </div>
            {isListingRequestPending && (
              <p className="font-12 md:font-14 font-semibold text-[#B7791F] bg-[#FFF4E0] inline-block px-4 py-2 rounded-lg">
                Pending — Awaiting Admin Approval
              </p>
            )}
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        {aaIndex !== 2 && aaIndex !== 3 && (
          <div className="pt-4 border-t border-gray-100 dark:border-white/5">
            {aaIndex === 1 && groupJoinRequiredError && (
              <p className="text-red-500 font-12 mb-2 text-right">
                {groupJoinRequiredError}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              {aaIndex === 1 && !assetIdParam && (
                <button
                  type="button"
                  onClick={() => {
                    const saved = saveDraft();
                    toast[saved ? 'success' : 'error'](
                      saved ? 'Draft saved.' : 'Failed to save draft.'
                    );
                  }}
                  className="bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition cursor-pointer mr-auto"
                >
                  Save Draft
                </button>
              )}
              {aaIndex === 1 && !assetIdParam && (
                <button
                  type="button"
                  onClick={() => {
                    clearDraft();
                    setFormData(initailState);
                    setUploadedDocs([]);
                    setPreviewImages([]);
                    setImages([]);
                    setVideoFiles([]);
                    setPreviewVideos([]);
                    setUploadedVideoDocs([]);
                    setSelectedGroupIds([]);
                    toast.success('Form cleared.');
                  }}
                  className="bg-white dark:bg-white/5 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-12 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                >
                  Clear Form
                </button>
              )}
              {aaIndex > 1 && (
                <button
                  onClick={() => aaNav(-1)}
                  className="bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition"
                >
                  Back
                </button>
              )}
              {aaIndex < 6 &&
                (aaIndex !== 5 ||
                  (isLegalReviewApproved &&
                    isValuationReviewApproved &&
                    isDueDiligenceApproved)) && (
                  <button
                    onClick={async () => {
                      if (aaIndex === 1) {
                        if (unjoinedSelectedIds.length > 0) {
                          setGroupJoinRequiredError(
                            unjoinedSelectedIds.length === 1
                              ? 'Please join the selected primary club before submitting.'
                              : 'Please join all selected primary clubs before submitting.'
                          );
                          return;
                        }
                        setGroupJoinRequiredError('');

                        const res = await submitAssetForm();

                        if (res?.success && !assetIdParam) {
                          setVideoFiles([]);
                          setPreviewVideos([]);
                          setUploadedVideoDocs([]);
                        }

                        const newId =
                          res?.success &&
                          res.data &&
                          typeof res.data === 'object' &&
                          'id' in res.data
                            ? (res.data as { id: number | string }).id
                            : undefined;
                        if (newId && !assetIdParam) {
                          const params = new URLSearchParams(searchParams);
                          params.set('id', String(newId));
                          navigate(
                            `${location.pathname}?${params.toString()}`,
                            {
                              replace: true,
                            }
                          );
                        }
                      } else {
                        aaNav(1);
                      }
                    }}
                    disabled={
                      aaIndex === 1 &&
                      (submittingAsset || isUploading || isVideoUploading)
                    }
                    className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {aaIndex === 1 && submittingAsset ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : aaIndex === 1 && assetIdParam ? (
                      'Resubmit for Review'
                    ) : aaIndex === 4 || aaIndex === 5 ? (
                      'Continue'
                    ) : (
                      'Save & Continue'
                    )}
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        onContinue={() => setStatusModal((prev) => ({ ...prev, open: false }))}
      />
      <CommonModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name}
        className="max-w-3xl"
        contentClassName="p-4"
      >
        {previewDoc &&
          (() => {
            const kind = getPreviewKind(previewDoc.url);
            if (kind === 'image') {
              return (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="w-full max-h-[75vh] object-contain rounded-lg"
                />
              );
            }
            if (kind === 'video') {
              return (
                <video
                  src={previewDoc.url}
                  controls
                  className="w-full max-h-[75vh] rounded-lg"
                />
              );
            }
            if (kind === 'pdf') {
              return (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[75vh] rounded-lg border border-[#E3E7EE] dark:border-white/10"
                />
              );
            }
            return (
              <div className="text-center py-10 space-y-3">
                <p className="font-12 md:font-14 text-gray-500">
                  Preview isn&apos;t available for this file type.
                </p>
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] transition"
                >
                  Open in New Tab
                </a>
              </div>
            );
          })()}
      </CommonModal>
    </div>
  );
}
