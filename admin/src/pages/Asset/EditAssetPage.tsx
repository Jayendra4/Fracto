import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/customSelect';
import { z } from 'zod';
import {
  UpdateAssetPayload,
  useGetAssetByIdQuery,
  useUpdateAssetMutation,
} from '@/store/api/assetsApi';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useNavigate, useParams } from 'react-router-dom';
import { getMetaValue } from '@/utils/assetMeta';
import { BackButton } from '@/components/common/BackButton';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';
import { Controller, useWatch } from 'react-hook-form';
import {
  useGetCountriesQuery,
  useGetStatesQuery,
  useGetCitiesQuery,
} from '@/store/api/location.api';
import { useState } from 'react';

const editAssetSchema = z.object({
  assetTitle: z.string().min(1, 'Title is required'),
  assetType: z.string().min(1, 'Asset Type is required'),
  assetSubType: z.string().min(1, 'Subtype is required'),
  ownershipModel: z.string().min(1, 'Ownership model is required'),
  currentOwnerName: z.string().min(1, 'Owner name is required'),
  titleStatus: z.string().min(1, 'Title Status is required'),
  builtupArea: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .refine((v) => v === undefined || v > 0, {
      message: 'Builtup area must be greater than 0',
    }),
  landArea: z.string().refine((v) => parseFloat(v) > 0, 'Land area must be greater than 0'),
  yearOfConstruction: z.number().min(1800).max(new Date().getFullYear()),
  assetAge: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce
      .number()
      .min(0, 'Asset age must be at least 0')
      .max(300, 'Asset age must be less than 300')
      .optional()
  ),
  marketValue: z.string().min(1, 'Market Value is required'),
  rentalIncomeMonthly: z.string().min(3, 'Rental Income Monthly is required'),

  leaseTenureRemainingMonths: z.number().min(2, 'Lease tenure cannot be negative'),
  expectedAppreciationPercentage: z
    .number()
    .min(2, 'Expected Appreciation Percentage cannot be zero'),
  netOperationalIncome: z.string().min(1, 'Net Operational Incomeis required'),
  shortDescription: z.string().min(1, 'Short Description is required'),
  detailedDescription: z.string().min(1, 'Detailed Description is required'),
  city: z.string().min(1, 'City name is required'),
  state: z.string().min(1, 'State name is required'),
  country: z.string().min(1, 'Country name is required'),
  pincode: z.string().min(1, 'Pincode Value is required'),
  geoLocation: z.string().min(1, 'Geolocation is required'),
  valuationReportDate: z.string().min(1, ' valuationReportDate is required'),
  last3YearRevenue: z.string().min(1, 'Last 3 Year Revenue is required'),
  currentPricePerFraction: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val),
    z.number().optional()
  ),
});

type EditAssetFormData = z.infer<typeof editAssetSchema>;

const EditAssetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: asset,
    isLoading,
    isError,
  } = useGetAssetByIdQuery(Number(id), {
    skip: !id,
  });

  const [updateAsset, { isLoading: updatingAsset, error }] = useUpdateAssetMutation();
  const shouldShowPrice = asset?.status === 'Available';
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i);
  const Title = asset?.assetTitle;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<EditAssetFormData>({
    resolver: zodResolver(editAssetSchema),
  });

  const [search, setSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const selectedCountry = useWatch({ control, name: 'country' });
  const selectedState = useWatch({ control, name: 'state' });
  const selectedYearOfConstruction = useWatch({
    control,
    name: 'yearOfConstruction',
  });

  useEffect(() => {
    if (selectedYearOfConstruction) {
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - selectedYearOfConstruction;

      setValue('assetAge', calculatedAge);
    } else {
      setValue('assetAge', undefined);
    }
  }, [selectedYearOfConstruction, setValue]);

  const { data: countries } = useGetCountriesQuery();

  const { data: states } = useGetStatesQuery(selectedCountry ?? '', {
    skip: !selectedCountry,
  });

  const { data: cities } = useGetCitiesQuery(
    {
      countryCode: selectedCountry ?? '',
      stateCode: selectedState ?? '',
    },
    {
      skip: !selectedCountry || !selectedState,
    }
  );

  const handleUpdateAsset = async (data: EditAssetFormData) => {
    try {
      type MetaType = 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN';

      const metaPayload: { metaKey: string; metaValue: string; metaType: MetaType }[] = [
        { metaKey: 'titleStatus', metaValue: data.titleStatus, metaType: 'STRING' },
        { metaKey: 'assetSubType', metaValue: data.assetSubType, metaType: 'STRING' },

        // { metaKey: 'builtupArea', metaValue: data.builtupArea.toString(), metaType: 'NUMBER' },
        { metaKey: 'landArea', metaValue: data.landArea.toString(), metaType: 'NUMBER' },
        {
          metaKey: 'yearOfConstruction',
          metaValue: data.yearOfConstruction.toString(),
          metaType: 'NUMBER',
        },
        {
          metaKey: 'assetAge',
          metaValue: (data.assetAge ?? 0).toString(),
          metaType: 'NUMBER' as MetaType,
        },

        { metaKey: 'marketValue', metaValue: data.marketValue.toString(), metaType: 'NUMBER' },
        {
          metaKey: 'rentalIncomeMonthly',
          metaValue: data.rentalIncomeMonthly.toString(),
          metaType: 'NUMBER',
        },
        {
          metaKey: 'leaseTenureRemainingMonths',
          metaValue: data.leaseTenureRemainingMonths.toString(),
          metaType: 'NUMBER',
        },
        {
          metaKey: 'expectedAppreciationPercentage',
          metaValue: data.expectedAppreciationPercentage.toString(),
          metaType: 'NUMBER',
        },
        {
          metaKey: 'netOperationalIncome',
          metaValue: data.netOperationalIncome.toString(),
          metaType: 'NUMBER',
        },

        {
          metaKey: 'last3YearRevenue',
          metaValue: data.last3YearRevenue.toString(),
          metaType: 'NUMBER',
        },
        {
          metaKey: 'currentPricePerFraction',
          metaValue: (data.currentPricePerFraction ?? 0).toString(),
          metaType: 'NUMBER',
        },
        ...(data.builtupArea !== undefined
          ? [
              {
                metaKey: 'builtupArea',
                metaValue: data.builtupArea.toString(),
                metaType: 'NUMBER' as MetaType,
              },
            ]
          : []),

        ...(data.city
          ? [{ metaKey: 'city', metaValue: data.city, metaType: 'STRING' as MetaType }]
          : []),

        ...(data.state
          ? [{ metaKey: 'state', metaValue: data.state, metaType: 'STRING' as MetaType }]
          : []),

        ...(data.country
          ? [{ metaKey: 'country', metaValue: data.country, metaType: 'STRING' as MetaType }]
          : []),

        ...(data.pincode
          ? [
              {
                metaKey: 'pincode',
                metaValue: data.pincode.toString(),
                metaType: 'NUMBER' as MetaType,
              },
            ]
          : []),

        ...(data.detailedDescription
          ? [
              {
                metaKey: 'detailedDescription',
                metaValue: data.detailedDescription,
                metaType: 'STRING' as MetaType,
              },
            ]
          : []),

        ...(data.shortDescription
          ? [
              {
                metaKey: 'shortDescription',
                metaValue: data.shortDescription,
                metaType: 'STRING' as MetaType,
              },
            ]
          : []),

        ...(data.geoLocation
          ? [
              {
                metaKey: 'geoLocation',
                metaValue: data.geoLocation,
                metaType: 'STRING' as MetaType,
              },
            ]
          : []),

        ...(data.valuationReportDate
          ? [
              {
                metaKey: 'valuationReportDate',
                metaValue: data.valuationReportDate,
                metaType: 'DATE' as MetaType,
              },
            ]
          : []),
      ];

      // await updateAsset({
      //   id: Number(id),
      //   basicInfo: {
      //     assetTitle: data.assetTitle,
      //     assetType: data.assetType,
      //     ownershipModel: data.ownershipModel,
      //     currentOwnerName: data.currentOwnerName,
      //   },
      //   ...(data.currentPricePerFraction !== undefined && asset?.price?.id
      //     ? {
      //         price: {
      //           priceId: asset.price.id,
      //           currentPricePerFraction: String(data.currentPricePerFraction),
      //         },
      //       }
      //     : {}),
      //   meta: metaPayload,
      // }).unwrap();

      const payload: UpdateAssetPayload = {
        id: Number(id),
        basicInfo: {
          assetTitle: data.assetTitle,
          assetType: data.assetType,
          ownershipModel: data.ownershipModel,
          currentOwnerName: data.currentOwnerName,
        },
        meta: metaPayload,
      };

      if (data.currentPricePerFraction !== undefined) {
        if (asset?.price?.id) {
          payload.price = {
            priceId: asset.price.id,
            currentPricePerFraction: String(data.currentPricePerFraction),
          };
        }
      }

      await updateAsset(payload).unwrap();

      toast.success('Asset updated successfully!');
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update asset');
      console.error('Failed to update asset context', err);
    }
  };

  const isInitialLoad = useRef(true);
  // Store raw name values from API to convert to codes after location data loads
  const prefillStateRef = useRef('');
  const prefillCityRef = useRef('');

  useEffect(() => {
    if (asset && countries?.length && isInitialLoad.current) {
      const countryMeta = getMetaValue(asset.meta, 'country') || '';
      const stateMeta = getMetaValue(asset.meta, 'state') || '';
      const cityMeta = getMetaValue(asset.meta, 'city') || '';

      // API stores country as name ("India") but form uses isoCode ("IN")
      const matchedCountry = countries.find(
        (c) => c.isoCode === countryMeta || c.name.toLowerCase() === countryMeta.toLowerCase()
      );
      const countryIso = matchedCountry?.isoCode ?? '';

      // Store state/city names — will be resolved to codes after APIs load
      prefillStateRef.current = stateMeta;
      prefillCityRef.current = cityMeta;

      reset({
        assetTitle: asset.assetTitle || '',
        assetType: asset.assetType ?? '',
        ownershipModel: asset.ownershipModel,
        currentOwnerName: asset.currentOwnerName,

        titleStatus: getMetaValue(asset.meta, 'titleStatus') || '',
        assetSubType: getMetaValue(asset.meta, 'assetSubType') || '',

        builtupArea: getMetaValue(asset.meta, 'builtupArea')
          ? Number(getMetaValue(asset.meta, 'builtupArea'))
          : undefined,

        landArea: getMetaValue(asset.meta, 'landArea') || '',
        yearOfConstruction: Number(getMetaValue(asset.meta, 'yearOfConstruction')),
        assetAge: Number(getMetaValue(asset.meta, 'assetAge')),

        marketValue: getMetaValue(asset.meta, 'marketValue') || '',
        rentalIncomeMonthly: getMetaValue(asset.meta, 'rentalIncomeMonthly') || '',

        leaseTenureRemainingMonths:
          Number(getMetaValue(asset.meta, 'leaseTenureRemainingMonths')) || 0,

        expectedAppreciationPercentage:
          Number(getMetaValue(asset.meta, 'expectedAppreciationPercentage')) || 0,

        netOperationalIncome: getMetaValue(asset.meta, 'netOperationalIncome') || '',

        last3YearRevenue: getMetaValue(asset.meta, 'last3YearRevenue') || '',

        country: countryIso,
        state: '', // set after states load
        city: '', // set after cities load

        pincode: getMetaValue(asset.meta, 'pincode') || '',
        geoLocation: getMetaValue(asset.meta, 'geoLocation') || '',
        valuationReportDate: getMetaValue(asset.meta, 'valuationReportDate') || '',

        shortDescription: getMetaValue(asset.meta, 'shortDescription') || '',
        detailedDescription: getMetaValue(asset.meta, 'detailedDescription') || '',

        currentPricePerFraction: asset.price?.currentPricePerFraction
          ? Number(asset.price.currentPricePerFraction)
          : undefined,
      });

      isInitialLoad.current = false;
    }
  }, [asset, countries, reset]);

  // After states load, convert state name → code and set it
  useEffect(() => {
    if (states?.length && prefillStateRef.current) {
      const stateMeta = prefillStateRef.current;
      const matched = states.find(
        (s) => s.code === stateMeta || s.name.toLowerCase() === stateMeta.toLowerCase()
      );
      if (matched) {
        setValue('state', matched.code);
      }
      prefillStateRef.current = '';
    }
  }, [states, setValue]);

  // After cities load, set city name (cities are matched by name directly)
  useEffect(() => {
    if (cities?.length && prefillCityRef.current) {
      const cityMeta = prefillCityRef.current;
      const matched = cities.find((c) => c.name.toLowerCase() === cityMeta.toLowerCase());
      setValue('city', matched ? matched.name : cityMeta);
      prefillCityRef.current = '';
    }
  }, [cities, setValue]);

  // Clear state/city on user-triggered country change (skip during prefill)
  useEffect(() => {
    if (!isInitialLoad.current && !prefillStateRef.current && selectedCountry) {
      setValue('state', '');
      setValue('city', '');
    }
  }, [selectedCountry]);

  // Clear city on user-triggered state change (skip during prefill)
  useEffect(() => {
    if (!isInitialLoad.current && !prefillCityRef.current && selectedState) {
      setValue('city', '');
    }
  }, [selectedState]);

  return (
    <form onSubmit={handleSubmit(handleUpdateAsset)} className="max-w-4xl space-y-10">
      <div className="flex items-center gap-4">
        <BackButton />
        <h2 className="text-xl font-bold">{Title}</h2>
      </div>

      {error && (
        <ErrorBanner
          type="error"
          title="Update Asset Failed"
          message={(error as any)?.data?.message || 'Something went wrong'}
        />
      )}
      {/* ================= EDITABLE FIELDS ================= */}
      <h2 className="text-xl font-bold">Property Details</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label required>Asset Title</Label>
          <Input {...register('assetTitle')} />
        </div>

        <div className="space-y-2">
          <Label required>Asset Type</Label>
          <Input {...register('assetType')} />
        </div>

        <div className="space-y-2">
          <Label required>Asset Sub Type</Label>
          <Input {...register('assetSubType')} />
        </div>

        <div className="space-y-2">
          <Label required>Ownership Model</Label>
          <Input {...register('ownershipModel')} />
        </div>

        <div className="space-y-2">
          <Label required>Owner Name</Label>
          <Input {...register('currentOwnerName')} />
        </div>

        {/* Title Status */}
        <div className="space-y-2">
          <Label required>Title Status</Label>
          <CustomSelect {...register('titleStatus')}>
            <option value="" disabled>
              Select Title Status
            </option>
            <option value="clear">Clear Title</option>
            <option value="disputed">Disputed</option>
            <option value="litigation">Under Litigation</option>
            <option value="others">Others</option>
          </CustomSelect>
          {errors.titleStatus && (
            <p className="text-sm text-destructive">{errors.titleStatus.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Country</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => {
              const filtered =
                countries?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) || [];
              const selected = countries?.find((c) => c.isoCode === field.value);

              return (
                <div className="relative">
                  <div
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 items-center cursor-pointer text-sm hover:border-slate-500 transition-colors"
                    onClick={() => setOpenDropdownIndex(openDropdownIndex === 1 ? null : 1)}
                  >
                    <span className={selected ? 'text-slate-100' : 'text-slate-500'}>
                      {selected ? selected.name : 'Select Country'}
                    </span>
                  </div>
                  {openDropdownIndex === 1 && (
                    <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-md mt-1 z-50 shadow-lg">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 text-slate-100 text-sm border-b border-slate-700 outline-none placeholder:text-slate-500 rounded-t-md"
                        placeholder="Search country..."
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-slate-500">No results</div>
                        ) : (
                          filtered.map((c) => (
                            <div
                              key={c.isoCode}
                              onClick={() => { field.onChange(c.isoCode); setOpenDropdownIndex(null); setSearch(''); }}
                              className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer"
                            >
                              {c.name}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>State</Label>
          <Controller
            control={control}
            name="state"
            render={({ field }) => {
              const filtered =
                states?.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase())) || [];
              const selected = states?.find((s) => s.code === field.value);

              return (
                <div className="relative">
                  <div
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 items-center cursor-pointer text-sm hover:border-slate-500 transition-colors"
                    onClick={() => setOpenDropdownIndex(openDropdownIndex === 2 ? null : 2)}
                  >
                    <span className={selected ? 'text-slate-100' : 'text-slate-500'}>
                      {selected ? selected.name : 'Select State'}
                    </span>
                  </div>
                  {openDropdownIndex === 2 && (
                    <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-md mt-1 z-50 shadow-lg">
                      <input
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 text-slate-100 text-sm border-b border-slate-700 outline-none placeholder:text-slate-500 rounded-t-md"
                        placeholder="Search state..."
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-slate-500">No results</div>
                        ) : (
                          filtered.map((s) => (
                            <div
                              key={s.code}
                              onClick={() => { field.onChange(s.code); setOpenDropdownIndex(null); setStateSearch(''); }}
                              className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer"
                            >
                              {s.name}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>City</Label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => {
              const filtered =
                cities?.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase())) || [];
              const selected = cities?.find((c) => c.name === field.value);

              return (
                <div className="relative">
                  <div
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 items-center cursor-pointer text-sm hover:border-slate-500 transition-colors"
                    onClick={() => setOpenDropdownIndex(openDropdownIndex === 3 ? null : 3)}
                  >
                    <span className={selected ? 'text-slate-100' : 'text-slate-500'}>
                      {selected ? selected.name : field.value || 'Select City'}
                    </span>
                  </div>
                  {openDropdownIndex === 3 && (
                    <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-md mt-1 z-50 shadow-lg">
                      <input
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 text-slate-100 text-sm border-b border-slate-700 outline-none placeholder:text-slate-500 rounded-t-md"
                        placeholder="Search city..."
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-slate-500">No results</div>
                        ) : (
                          filtered.map((c) => (
                            <div
                              key={c.name}
                              onClick={() => { field.onChange(c.name); setOpenDropdownIndex(null); setCitySearch(''); }}
                              className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer"
                            >
                              {c.name}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Pincode</Label>
          <Input {...register('pincode')} />
        </div>
        <div className="space-y-2">
          <Label>Geo Location (Lat, Long)</Label>
          <Input {...register('geoLocation')} />
        </div>
        <div className="space-y-2">
          <Label>Valuation Report Date</Label>
          <Input type="date" {...register('valuationReportDate')} />
        </div>
        {/* Land Area */}
        <div className="space-y-2">
          <Label required>Land Area (Sq.ft / Meter)</Label>
          <Input {...register('landArea')} />
          {errors.landArea && <p className="text-sm text-destructive">{errors.landArea.message}</p>}
        </div>

        {/* Builtup Area */}
        <div className="space-y-2">
          <Label>Builtup Area (Sq.ft / Meter)</Label>
          <Input {...register('builtupArea')} />
          {errors.builtupArea && (
            <p className="text-sm text-destructive">{errors.builtupArea.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Expected Appreciation Percentage</Label>
          <Input {...register('expectedAppreciationPercentage', { valueAsNumber: true })} />
          {errors.expectedAppreciationPercentage && (
            <p className="text-sm text-destructive">
              {errors.expectedAppreciationPercentage.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Net Operational Income</Label>
          <Input {...register('netOperationalIncome')} />
          {errors.netOperationalIncome && (
            <p className="text-sm text-destructive">{errors.netOperationalIncome.message}</p>
          )}
        </div>

        {/* Year of Construction */}
        <div className="space-y-2">
          <Label required>Year of Construction</Label>
          <CustomSelect {...register('yearOfConstruction', { valueAsNumber: true })}>
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </CustomSelect>
          {errors.yearOfConstruction && (
            <p className="text-sm text-destructive">{errors.yearOfConstruction.message}</p>
          )}
        </div>

        {/* Asset Age */}
        <div className="col-span-2 space-y-2">
          <Label>Asset Age (Optional)</Label>
          <Input disabled type="number" {...register('assetAge')} />
          {errors.assetAge && <p className="text-sm text-destructive">{errors.assetAge.message}</p>}
        </div>
      </div>

      {/* Short Description*/}
      <div className="space-y-2">
        <Label>Short Description</Label>
        <Textarea
          rows={3}
          placeholder="Enter short description"
          {...register('shortDescription')}
        />
      </div>

      {/* Detailed Description */}
      <div className="space-y-2">
        <Label>Detailed Description</Label>
        <Textarea
          rows={5}
          placeholder="Enter detailed description"
          {...register('detailedDescription')}
        />
      </div>

      <h2 className="text-xl font-bold">Financial & Valuation Details</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Builtup Area */}
        <div className="space-y-2">
          <Label required>Market Value</Label>
          <Input {...register('marketValue')} />
          {errors.marketValue && (
            <p className="text-sm text-destructive">{errors.marketValue.message}</p>
          )}
        </div>

        {/* Land Area */}
        <div className="space-y-2">
          <Label required>Rental Income (Monthly)</Label>
          <Input {...register('rentalIncomeMonthly')} />
          {errors.rentalIncomeMonthly && (
            <p className="text-sm text-destructive">{errors.rentalIncomeMonthly.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label required>Lease Tenure Remaining (Months)</Label>
          <Input
            type="number"
            {...register('leaseTenureRemainingMonths', {
              valueAsNumber: true,
            })}
          />
          {errors.leaseTenureRemainingMonths && (
            <p className="text-sm text-destructive">{errors.leaseTenureRemainingMonths.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label required>Last 3 Year Revenue</Label>
          <Input {...register('last3YearRevenue')} />
          {errors.last3YearRevenue && (
            <p className="text-sm text-destructive">{errors.last3YearRevenue.message}</p>
          )}
        </div>
        {shouldShowPrice && (
          <div className="space-y-2">
            <Label required>Price Per Fraction</Label>
            <Input
              type="number"
              {...register('currentPricePerFraction', { valueAsNumber: true })}
            />
            {errors?.currentPricePerFraction && (
              <p className="text-sm text-destructive">{errors?.currentPricePerFraction.message}</p>
            )}
          </div>
        )}
      </div>
      {/* ================= ACTIONS ================= */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button disabled={updatingAsset || isLoading} type="submit">
          {updatingAsset ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default EditAssetPage;
