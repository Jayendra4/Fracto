import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CustomSelect } from '@/components/ui/customSelect';
import GeoLocationPicker from '@/components/Map/GeoLocationPicker';
import UploadMultipleImages from '@/components/common/UploadMultipleImages';
import UploadMultipleVideos from '@/components/common/UploadMultipleVideos';
import { RWA_STORAGE_KEY } from '@/utils/constants';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useGetIconListQuery } from '@/store/api/assetsApi';
import {
  useGetCitiesQuery,
  useGetCountriesQuery,
  useGetStatesQuery,
} from '@/store/api/location.api';

const GEO_REGEX =
  /^-?(?:90(?:\.0+)?|[1-8]?\d(?:\.\d+)?),\s*-?(?:180(?:\.0+)?|1[0-7]\d(?:\.\d+)?|[1-9]?\d(?:\.\d+)?)$/;

const assetSchema = z.object({
  assetType: z.string().nonempty('Asset type is required'),

  assetSubType: z
    .string()
    .nonempty('Asset sub-type is required')
    .min(2, 'Minimum 2 characters required'),

  assetTitle: z
    .string()
    .nonempty('Asset title is required')
    .min(5, 'Minimum 5 characters required'),

  shortDescription: z
    .string()
    .nonempty('Short description is required')
    .min(50, 'Minimum 50 characters required')
    .max(250, 'Maximum 250 characters allowed'),

  detailedDescription: z
    .string()
    .nonempty('Detailed description is required')
    .min(100, 'Minimum 100 characters required')
    .max(2000, 'Maximum 2000 characters allowed'),

  city: z.string().nonempty('City is required').min(2, 'Minimum 2 characters required'),

  state: z.string().nonempty('State is required').min(2, 'Minimum 2 characters required'),
  country: z.string().nonempty('Country is required').min(2, 'Minimum 2 characters required'),

  // country: z.enum(['IN', 'AE'], {
  //   errorMap: () => ({ message: 'Country is required' }),
  // }),
  isVerified: z.boolean().optional(),
  pincode: z.string().nonempty('Pincode is required').min(4, 'Invalid pincode'),
  assetImages: z
    .array(z.string().url())
    .min(5, 'At least 5 images are required')
    .max(20, 'Maximum 20 images allowed'),
  assetVideos: z
    .array(z.string().url())
    .min(1, 'At least 1 video is required')
    .max(5, 'Maximum 5 videos allowed'),

  whyInvested: z
    .array(
      z.object({
        icon: z.string().nonempty('Icon is required'),

        title: z
          .string()
          .nonempty('Title is required')
          .refine((val) => {
            const count = val.trim().split(/\s+/).length;
            return count >= 3 && count <= 15;
          }, 'Title must be between 3 to 15 words'),

        description: z
          .string()
          .nonempty('Description is required')
          .refine((val) => {
            const count = val.trim().split(/\s+/).length;
            return count >= 30 && count <= 150;
          }, 'Description must be between 30 to 120 words'),
      })
    )
    .length(4, 'All 4 entries are required'),
  geoLocation: z.object({
    coordinates: z
      .string()
      .nonempty('Geo location is required')
      .regex(GEO_REGEX, 'Enter valid latitude, longitude'),

    address: z
      .object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        pincode: z.string().optional(),
      })
      .optional(),

    markers: z
      .array(
        z.object({
          lat: z.number(),
          lng: z.number(),
        })
      )
      .optional(),

    polygonPath: z
      .array(
        z.object({
          lat: z.number(),
          lng: z.number(),
        })
      )
      .optional(),

    polygonArea: z.number().nullable().optional(),
    // isVerified: z.boolean().optional(),
  }),
});

// const iconOptions = [
//   { label: 'Growth', value: '7', url: '' },
//   { label: 'Location', value: '2', url: '' },
//   { label: 'ROI', value: '3', url: '' },
//   { label: 'Demand', value: '4', url: '' },
//   { label: 'NEw ', value: '5', url: '' },
// ];

export type AssetFormData = z.infer<typeof assetSchema>;

const AssetInfo = ({ onNext }: { onNext: (data: AssetFormData) => void }) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    mode: 'onSubmit', // default
    reValidateMode: 'onChange', //
    defaultValues: {
      assetType: '',
      assetSubType: '',
      assetTitle: '',
      shortDescription: '',
      detailedDescription: '',
      isVerified: true,
      city: '',
      state: '',
      country: '',
      pincode: '',
      assetImages: [],
      assetVideos: [],
      whyInvested: [
        { icon: '', title: '', description: '' },
        { icon: '', title: '', description: '' },
        { icon: '', title: '', description: '' },
        { icon: '', title: '', description: '' },
      ],
      geoLocation: {
        coordinates: '',
        address: {},
        markers: [],
        polygonPath: [],
        polygonArea: null,
      },
    },
  });

  const { data: iconsData = [] } = useGetIconListQuery();
  const [search, setSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [country, setCountry] = useState('');
  const [countryState, setCountryState] = useState('');

  useEffect(() => {
    if (country) {
      setValue('state', '');
      setValue('city', '');
    }
  }, [country, setValue]);

  useEffect(() => {
    if (countryState) {
      setValue('city', '');
    }
  }, [countryState, setValue]);

  const { data: countries } = useGetCountriesQuery();

  const { data: states } = useGetStatesQuery(country ?? '', {
    skip: !country,
  });

  const { data: cities } = useGetCitiesQuery(
    {
      countryCode: country ?? '',
      stateCode: countryState ?? '',
    },
    {
      skip: !country || !countryState,
    }
  );
  const iconOptions =
    iconsData?.map((item) => ({
      label: item.name,
      value: String(item.id),
      url: item.url,
    })) || [];

  const values = useWatch({
    control,
    name: 'whyInvested',
  }) as any[];

  const [activeIndex, setActiveIndex] = useState(0); // accordion
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null); // dropdown

  const selectedIcons = values?.map((item) => item?.icon).filter(Boolean) || [];

  const getFilteredOptions = (currentIndex: number) => {
    return iconOptions.filter((opt) => {
      const isSelectedElsewhere = selectedIcons.includes(opt.value);
      const isCurrentSelected = values?.[currentIndex]?.icon === opt.value;
      return !isSelectedElsewhere || isCurrentSelected;
    });
  };

  const isFilled = (index: number) => {
    const item = values?.[index];
    return item?.icon && item?.title && item?.description;
  };

  /* ---------- LOAD SAVED DATA ---------- */
  useEffect(() => {
    const saved = localStorage.getItem(RWA_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (!parsed.assetInfo) return;

    reset(parsed.assetInfo);
  }, [reset, setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      const saved = JSON.parse(localStorage.getItem(RWA_STORAGE_KEY) || '{}');
      localStorage.setItem(
        RWA_STORAGE_KEY,
        JSON.stringify({
          ...saved,
          assetInfo: value,
        })
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: AssetFormData) => {
    onNext({
      ...data,
      // assetSubType: data.assetSubType || '', // ✅ force
      isVerified: true, // ✅ force
    });
  };

  const onError = (errors: any) => {
    // first error field par focus
    const firstError = Object.keys(errors)[0];
    const el = document.querySelector(`[name="${firstError}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      <h2 className="text-2xl font-bold">Step 1 – Asset Details</h2>

      {/* ASSET TYPE */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label required>Asset Type</Label>

          <CustomSelect {...register('assetType')} defaultValue="">
            <option value="" disabled>
              Select Asset Type
            </option>
            <option value="RealEstate">Real Estate</option>
            <option value="Solar">Solar</option>
            <option value="Machinery">Machinery</option>
            <option value="EVFleet">EV Fleet</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Store">Store</option>
            <option value="Gold">Gold</option>
            <option value="Business">Business</option>
            <option value="IP">IP</option>
            <option value="Others">Others</option>
          </CustomSelect>

          {errors.assetType && (
            <p className="text-sm text-destructive">{errors.assetType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Asset Sub-Type</Label>

          <CustomSelect {...register('assetSubType')} defaultValue="">
            <option value="" disabled>
              Select Asset Sub-Type
            </option>
            <option value="Industrial">Industrial</option>
            <option value="Commercial">Commercial</option>
            <option value="Retail">Retail</option>
            <option value="Residential">Residential</option>
          </CustomSelect>

          {errors.assetSubType && (
            <p className="text-sm text-destructive">{errors.assetSubType.message}</p>
          )}
        </div>

        {/* <div className="space-y-2">
          <Label required>Asset Sub-Type</Label>
          <Input {...register('assetSubType')} />
          {errors.assetSubType && (
            <p className="text-sm text-destructive">{errors.assetSubType.message}</p>
          )}
        </div> */}

        <div className="col-span-2 space-y-2">
          <Label required>Asset Title</Label>
          <Input {...register('assetTitle')} />
          {errors.assetTitle && (
            <p className="text-sm text-destructive">{errors.assetTitle.message}</p>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-2 space-y-2">
          <Label required>Short Description</Label>
          <Textarea {...register('shortDescription')} />
          {errors.shortDescription && (
            <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          <Label required>Detailed Description</Label>
          <Textarea {...register('detailedDescription')} />
          {errors.detailedDescription && (
            <p className="text-sm text-destructive">{errors.detailedDescription.message}</p>
          )}
        </div>
      </div>

      {/* LOCATION */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label required>Country</Label>

          <Controller
            control={control}
            name="country"
            render={({ field }) => {
              const filteredCountries =
                countries?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) || [];

              const selected = countries?.find((c) => c.name === field.value);

              return (
                <div className="relative">
                  {/* SELECT BOX */}
                  <div
                    className="flex h-10 w-full rounded-md border border-white/40 px-3 items-center justify-between cursor-pointer"
                    onClick={() => setOpenDropdownIndex(openDropdownIndex === 100 ? null : 100)}
                  >
                    {selected ? (
                      <div className="flex items-center gap-2">
                        <span>{selected.flag}</span>
                        <span>{selected.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Select Country</span>
                    )}
                  </div>

                  {/* DROPDOWN */}
                  {openDropdownIndex === 100 && (
                    <div className="absolute z-50 mt-1 w-full bg-black border border-white/20 rounded-md max-h-60 overflow-auto">
                      <input
                        type="text"
                        placeholder="Search country..."
                        className="w-full p-2 border-b border-white/20 bg-black outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />

                      {filteredCountries.map((c) => (
                        <div
                          key={c.isoCode}
                          className="px-3 py-2 hover:bg-gray-800 cursor-pointer flex gap-2"
                          onClick={() => {
                            field.onChange(c.name);
                            field.onBlur();
                            setValue('country', c.name, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setOpenDropdownIndex(null);
                            setCountry(c.isoCode);

                            setSearch('');
                          }}
                        >
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
        </div>
        <div className="space-y-2">
          <Label required>State</Label>

          <Controller
            control={control}
            name="state"
            render={({ field }) => {
              const filteredStates =
                states?.filter((s) => s.name.toLowerCase().includes(stateSearch.toLowerCase())) ||
                [];

              const selected = states?.find((s) => s.name === field.value);

              return (
                <div className="relative">
                  {/* SELECT BOX */}
                  <div
                    className="flex h-10 w-full rounded-md border border-input px-3 items-center justify-between cursor-pointer"
                    onClick={() => setOpenDropdownIndex(openDropdownIndex === 200 ? null : 200)}
                  >
                    {selected ? (
                      <span>{selected.name}</span>
                    ) : (
                      <span className="text-gray-400">Select State</span>
                    )}
                  </div>

                  {/* DROPDOWN */}
                  {openDropdownIndex === 200 && (
                    <div className="absolute z-50 mt-1 w-full bg-black border rounded-md max-h-60 overflow-auto">
                      {/* SEARCH */}
                      <input
                        type="text"
                        placeholder="Search state..."
                        className="w-full p-2 border-b bg-black outline-none"
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                      />

                      {/* LIST */}
                      {filteredStates.map((s) => (
                        <div
                          key={s.code}
                          className="px-3 py-2 hover:bg-gray-800 cursor-pointer"
                          onClick={() => {
                            field.onChange(s.name); // ✅ IMPORTANT
                            setOpenDropdownIndex(null);
                            setCountryState(s.code);
                            setStateSearch('');
                          }}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
          {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
        </div>
        <div className="space-y-2">
          <Label required>City</Label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => {
              const filteredCities =
                cities?.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase())) ||
                [];

              const selected = cities?.find((c) => c.name === field.value);

              return (
                <div className="relative">
                  {/* SELECT BOX */}
                  <div
                    className="flex h-10 w-full rounded-md border border-input px-3 items-center justify-between cursor-pointer"
                    onClick={() => setOpenDropdownIndex(openDropdownIndex === 300 ? null : 300)}
                  >
                    {selected ? (
                      <span>{selected.name}</span>
                    ) : (
                      <span className="text-gray-400">Select City</span>
                    )}
                  </div>

                  {/* DROPDOWN */}
                  {openDropdownIndex === 300 && (
                    <div className="absolute z-50 mt-1 w-full bg-black border rounded-md max-h-60 overflow-auto">
                      {/* SEARCH */}
                      <input
                        type="text"
                        placeholder="Search city..."
                        className="w-full p-2 border-b bg-black outline-none"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                      />

                      {/* LIST */}
                      {filteredCities.map((c) => (
                        <div
                          key={c.name}
                          className="px-3 py-2 hover:bg-gray-800 cursor-pointer"
                          onClick={() => {
                            field.onChange(c.name); // ✅ IMPORTANT
                            setOpenDropdownIndex(null);
                            setCitySearch('');
                          }}
                        >
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label required>Pincode</Label>
          <Input placeholder="Pincode" {...register('pincode')} />
          {errors.pincode && <p className="text-sm text-destructive">{errors.pincode.message}</p>}
        </div>
      </div>

      <Controller
        name="geoLocation"
        control={control}
        rules={{
          required: 'Geo location is required',
          validate: (val) =>
            GEO_REGEX.test(val?.coordinates ?? '') || 'Enter valid latitude, longitude',
        }}
        render={({ field }) => (
          <GeoLocationPicker
            value={field.value?.coordinates}
            onChange={(coords) => {
              field.onChange({
                ...field.value,
                coordinates: coords,
              });
            }}
            onAddressDetected={(address) => {
              setValue(
                'geoLocation',
                {
                  ...field.value,
                  address,
                },
                { shouldDirty: true }
              );
            }}
            onGeoDataChange={(geo) => {
              setValue(
                'geoLocation',
                {
                  ...field.value,
                  markers: geo.markers,
                  polygonPath: geo.polygonPath,
                  polygonArea: geo.polygonArea,
                },
                { shouldDirty: true }
              );
            }}
          />
        )}
      />

      <Controller
        name="assetImages"
        control={control}
        rules={{ required: 'Images are required' }}
        render={({ field }) => (
          <UploadMultipleImages
            label="Asset Images"
            value={field.value}
            maxFiles={20}
            onChange={(urls) => field.onChange(urls)}
            required={true}
          />
        )}
      />
      {errors.assetImages && (
        <p className="text-sm text-destructive">{errors.assetImages.message}</p>
      )}
      <Controller
        name="assetVideos"
        control={control}
        render={({ field }) => (
          <UploadMultipleVideos
            label="Asset Videos"
            value={field.value}
            maxFiles={5}
            onChange={(videos) => field.onChange(videos || [])} // 🔥 important
            // onChange={field.onChange}
            required={true}
          />
        )}
      />

      {errors.assetVideos && (
        <p className="text-sm text-destructive">{errors.assetVideos.message}</p>
      )}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Why Invested</h3>

        {[0, 1, 2, 3].map((index) => {
          const isOpen = activeIndex === index;

          return (
            <div key={index} className="rounded-xl border border-white/10 bg-background">
              {/* HEADER */}
              <div
                onClick={() => setActiveIndex(index)}
                className={`p-4 cursor-pointer flex justify-between items-center transition ${
                  isOpen ? 'bg-muted/30' : 'hover:bg-muted/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-sm">
                    {index + 1}
                  </div>

                  <p className="font-medium">Investment Reason {index + 1}</p>

                  {isFilled(index) && <span className="text-green-500">✔</span>}
                </div>

                <span className={`transition ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {isOpen && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-12 gap-4">
                    {/* ICON */}

                    <div className="col-span-12 md:col-span-6 relative">
                      <Controller
                        control={control}
                        name={`whyInvested.${index}.icon`}
                        render={({ field }) => {
                          const selectedOption = iconOptions.find(
                            (opt) => opt.value === field.value
                          );

                          return (
                            <>
                              {/* SELECT BOX */}
                              <div
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer items-center justify-between"
                                onClick={(e) => {
                                  e.stopPropagation(); // 🔥 important
                                  setOpenDropdownIndex(openDropdownIndex === index ? null : index);
                                }}
                              >
                                {selectedOption ? (
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={selectedOption.url}
                                      className="w-5 h-5 object-contain"
                                    />
                                    <span>{selectedOption.label}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Select Icon</span>
                                )}

                                <span className={`transition ${isOpen ? 'rotate-180' : ''}`}>
                                  ▼
                                </span>
                              </div>

                              {/* DROPDOWN */}
                              {openDropdownIndex === index && (
                                <div className="absolute z-20 mt-1 w-full rounded-md border border-input bg-background shadow max-h-60 overflow-auto">
                                  {getFilteredOptions(index).map((opt) => (
                                    <div
                                      key={opt.value}
                                      onClick={(e) => {
                                        e.stopPropagation(); // 🔥 VERY IMPORTANT
                                        field.onChange(opt.value);
                                        setOpenDropdownIndex(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted/20 cursor-pointer"
                                    >
                                      <img src={opt.url} className="w-5 h-5 object-contain" />
                                      <span>{opt.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        }}
                      />

                      {errors?.whyInvested?.[index]?.icon && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.whyInvested[index]?.icon?.message}
                        </p>
                      )}
                    </div>

                    {/* TITLE */}
                    <div className="col-span-12 md:col-span-6">
                      <Controller
                        control={control}
                        name={`whyInvested.${index}.title`}
                        render={({ field }) => (
                          <>
                            <Input {...field} placeholder="Enter title" />
                            <p className="text-xs text-gray-400 text-right">
                              {field.value?.trim()?.split(/\s+/)?.length || 0} words
                            </p>
                          </>
                        )}
                      />
                      {errors?.whyInvested?.[index]?.title && (
                        <p className="text-sm text-destructive">
                          {errors.whyInvested[index]?.title?.message}
                        </p>
                      )}
                    </div>

                    {/* DESCRIPTION FULL WIDTH */}
                    <div className="col-span-12">
                      <Controller
                        control={control}
                        name={`whyInvested.${index}.description`}
                        render={({ field }) => (
                          <>
                            <Textarea {...field} rows={4} />
                            <p className="text-xs text-gray-400 text-right">
                              {field.value?.trim()?.split(/\s+/)?.length || 0} words
                            </p>
                          </>
                        )}
                      />
                      {errors?.whyInvested?.[index]?.description && (
                        <p className="text-sm text-destructive">
                          {errors.whyInvested[index]?.description?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default AssetInfo;
