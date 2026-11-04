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

  country: z.enum(['india', 'uae'], {
    errorMap: () => ({ message: 'Country is required' }),
  }),

  pincode: z.string().nonempty('Pincode is required').min(4, 'Invalid pincode'),
  assetImages: z
    .array(z.string().url())
    .min(5, 'At least 5 images are required')
    .max(20, 'Maximum 20 images allowed'),
  assetVideos: z
    .array(z.string().url())
    .min(1, 'At least 1 video is required')
    .max(5, 'Maximum 5 videos allowed')
    .optional(),
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
  }),
});

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
    defaultValues: {
      assetType: '',
      assetSubType: '',
      assetTitle: '',
      shortDescription: '',
      detailedDescription: '',
      city: '',
      state: '',
      country: undefined,
      pincode: '',
      assetImages: [],
      geoLocation: {
        coordinates: '',
        address: {},
        markers: [],
        polygonPath: [],
        polygonArea: null,
      },
    },
  });

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
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Input {...register('assetSubType')} />
          {errors.assetSubType && (
            <p className="text-sm text-destructive">{errors.assetSubType.message}</p>
          )}
        </div>

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
          <Label required>City</Label>
          <Input placeholder="City" {...register('city')} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label required>State</Label>

          <Input placeholder="State" {...register('state')} />
          {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
        </div>
        <div className="space-y-2">
          <Label required>Country</Label>

          <CustomSelect {...register('country')} defaultValue="">
            <option value="" disabled>
              Select Country
            </option>
            <option value="india">India</option>
            <option value="uae">UAE</option>
          </CustomSelect>

          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
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
            onChange={field.onChange}
            required={true}
          />
        )}
      />

      {errors.assetVideos && (
        <p className="text-sm text-destructive">{errors.assetVideos.message}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default AssetInfo;
