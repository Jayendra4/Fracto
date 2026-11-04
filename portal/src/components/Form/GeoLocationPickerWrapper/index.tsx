import { GeoLocationPicker } from '@/components/Map';
import { Controller, useWatch } from 'react-hook-form';

const isEqual = (a: any, b: any) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export default function GeoLocationPickerWrapper({
  field,
  control,
  setValue,
}: any) {
  const extraMarkers = useWatch({ control, name: 'extraMarkers' });
  const polygonPath = useWatch({ control, name: 'polygonPath' });
  const polygonArea = useWatch({ control, name: 'polygonArea' });

  return (
    <Controller
      name={field.name}
      control={control}
      rules={field.validation}
      render={({ field: controllerField, fieldState }) => (
        <div>
          <GeoLocationPicker
            value={controllerField.value}
            onChange={(latLng) => {
              if (latLng !== controllerField.value) {
                controllerField.onChange(latLng);
                controllerField.onBlur();
              }
            }}
            onAddressDetected={(data) => {
              if (data.city) setValue('city', data.city);
              if (data.state) setValue('state', data.state);
              if (data.country) setValue('country', data.country.toLowerCase());
              if (data.pincode) setValue('pincode', data.pincode);
            }}
            onGeoDataChange={(geo) => {
              if (!isEqual(geo.markers, extraMarkers)) {
                setValue('extraMarkers', geo.markers);
              }

              if (!isEqual(geo.polygonPath, polygonPath)) {
                setValue('polygonPath', geo.polygonPath);
              }

              if (geo.polygonArea !== polygonArea) {
                setValue('polygonArea', geo.polygonArea);
              }
            }}
          />

          {/* 👇 yahan error show hoga */}
          {fieldState.error && (
            <p className="text-red-500 text-sm mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
