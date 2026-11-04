import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
  DrawingManager,
  HeatmapLayer,
} from '@react-google-maps/api';
type GoogleMapsLibrary = 'places' | 'geometry' | 'drawing' | 'visualization';

interface GeoLocationPickerProps {
  value: string;
  onChange: (val: string) => void;
  onAddressDetected?: (address: {
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  }) => void;
  onGeoDataChange?: (data: {
    primaryLocation: { lat: number; lng: number } | null;
    markers: { lat: number; lng: number }[];
    polygonPath: { lat: number; lng: number }[];
    polygonArea: number | null;
  }) => void;
}

const containerStyle = {
  width: '100%',
  height: '300px',
};

const MAP_LIBRARIES: GoogleMapsLibrary[] = [
  'places',
  'geometry',
  'visualization',
  'drawing',
];

const darkMapTheme: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ color: '#292929' }] },
  { featureType: 'water', stylers: [{ color: '#0f0f0f' }] },
];

export default function GeoLocationPicker({
  value,
  onChange,
  onAddressDetected,
  onGeoDataChange,
}: GeoLocationPickerProps) {
  const searchRef = useRef<HTMLInputElement | null>(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const polygonRef = useRef<google.maps.Polygon | null>(null);

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    if (!value) return null;
    const [lat, lng] = value.split(',').map(Number);
    return { lat, lng };
  });

  const [extraMarkers, setExtraMarkers] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [polygonPath, setPolygonPath] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [polygonArea, setPolygonArea] = useState<number | null>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [drawMode, setDrawMode] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY!,
    libraries: MAP_LIBRARIES,
  });

  const reverseGeocode = async (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    const res = await geocoder.geocode({ location: { lat, lng } });
    if (!res.results?.length) return;

    const address = res.results[0].address_components;
    const get = (type: string) =>
      address.find((c) => c.types.includes(type))?.long_name;

    onAddressDetected?.({
      city: get('locality') || get('administrative_area_level_2'),
      state: get('administrative_area_level_1'),
      country: get('country'),
      pincode: get('postal_code'),
    });
  };

  const updatePolygonState = (poly: google.maps.Polygon) => {
    const pathArr = poly
      .getPath()
      .getArray()
      .map((ll) => ({
        lat: ll.lat(),
        lng: ll.lng(),
      }));
    const area = google.maps.geometry.spherical.computeArea(poly.getPath());

    setPolygonPath(pathArr);
    setPolygonArea(area);
  };

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const dom = e.domEvent as MouseEvent;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (dom.shiftKey) {
        setExtraMarkers((prev) => [...prev, { lat, lng }]);
        return;
      }

      setMarkerPosition({ lat, lng });
      onChange(`${lat},${lng}`);
      reverseGeocode(lat, lng);
    },
    [onChange]
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;

      setMarkerPosition({ lat, lng });
      onChange(`${lat},${lng}`);
      reverseGeocode(lat, lng);
    });
  };

  const onPlaceSelected = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return;

    const lat = place.geometry.location?.lat()!;
    const lng = place.geometry.location?.lng()!;

    setMarkerPosition({ lat, lng });
    onChange(`${lat},${lng}`);
    reverseGeocode(lat, lng);
  };

  const handlePolygonComplete = (poly: google.maps.Polygon) => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
    polygonRef.current = poly;

    updatePolygonState(poly);

    const path = poly.getPath();
    path.addListener('set_at', () => updatePolygonState(poly));
    path.addListener('insert_at', () => updatePolygonState(poly));
    path.addListener('remove_at', () => updatePolygonState(poly));

    setDrawMode(false);
  };

  useEffect(() => {
    if (!onGeoDataChange) return;

    onGeoDataChange({
      primaryLocation: markerPosition,
      markers: extraMarkers,
      polygonPath,
      polygonArea,
    });
  }, [markerPosition, extraMarkers, polygonPath, polygonArea, onGeoDataChange]);

  if (!isLoaded) return <div className="text-white">Loading map…</div>;

  const heatmapData = [
    ...(markerPosition
      ? [new google.maps.LatLng(markerPosition.lat, markerPosition.lng)]
      : []),
    ...extraMarkers.map((m) => new google.maps.LatLng(m.lat, m.lng)),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Autocomplete
          onLoad={(auto) => (autocompleteRef.current = auto)}
          onPlaceChanged={onPlaceSelected}
        >
          <input
            ref={searchRef}
            type="text"
            placeholder="Search building, area, city..."
            className="w-full px-3 py-2 bg-[var(--card)] border border-inactive-gray rounded-md text-sm text-[var(--fg)] outline-none"
          />
        </Autocomplete>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="px-3 py-2 bg-[#2F5BCC] rounded-md text-xs sm:text-sm text-white hover:bg-[#2346a0]"
          >
            Use My Location
          </button>

          <button
            type="button"
            onClick={() => setDrawMode((d) => !d)}
            className={`px-3 py-2 rounded-md text-xs sm:text-sm ${
              drawMode
                ? 'bg-[#10B981] text-black'
                : 'bg-[#111827] text-[#E5E7EB]'
            } border border-[#374151]`}
          >
            {drawMode ? 'Drawing… Click to finish' : 'Draw Boundary'}
          </button>

          <button
            type="button"
            onClick={() => setHeatmapEnabled((h) => !h)}
            className={`px-3 py-2 rounded-md text-xs sm:text-sm ${
              heatmapEnabled
                ? 'bg-[#F59E0B] text-black'
                : 'bg-[#111827] text-[#E5E7EB]'
            } border border-[#374151]`}
          >
            {heatmapEnabled ? 'Hide Heatmap' : 'Show Heatmap'}
          </button>
        </div>
      </div>

      {polygonArea !== null && (
        <p className="text-xs text-[#9CA3AF]">
          Selected area:{' '}
          <span className="font-semibold text-[#E5E7EB]">
            {(polygonArea / 1000000).toFixed(3)} km²
          </span>
        </p>
      )}

      <div className="rounded-2xl overflow-hidden border border-inactive-gray">
        <GoogleMap
          mapContainerStyle={containerStyle}
          zoom={15}
          center={
            markerPosition ?? {
              lat: 25.2048,
              lng: 55.2708,
            }
          }
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            styles: darkMapTheme,
            fullscreenControl: false,
          }}
        >
          {markerPosition && <Marker position={markerPosition} />}

          {extraMarkers.map((m, idx) => (
            <Marker
              key={`${m.lat}-${m.lng}-${idx}`}
              position={m}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: '#F59E0B',
                fillOpacity: 1,
                strokeColor: '#111827',
                strokeWeight: 1,
              }}
            />
          ))}

          {drawMode && (
            <DrawingManager
              onPolygonComplete={handlePolygonComplete}
              options={{
                drawingControl: false,
                polygonOptions: {
                  fillColor: '#2563EB',
                  fillOpacity: 0.25,
                  strokeColor: '#60A5FA',
                  strokeWeight: 2,
                  editable: true,
                  draggable: true,
                },
              }}
              drawingMode={google.maps.drawing.OverlayType.POLYGON}
            />
          )}

          {heatmapEnabled && heatmapData.length > 0 && (
            <HeatmapLayer data={heatmapData} />
          )}
        </GoogleMap>
      </div>

      <p className="text-[11px] text-[#6B7280]">
        Tip: Click on the map to set main location. <br />
        <span className="text-[#9CA3AF]">
          Shift + Click to drop extra markers. Use "Draw Boundary" to outline
          the full asset area.
        </span>
      </p>
    </div>
  );
}
