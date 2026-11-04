// import { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   GoogleMap,
//   Marker,
//   useJsApiLoader,
//   Autocomplete,
//   DrawingManager,
//   HeatmapLayer,
// } from '@react-google-maps/api';

// type GoogleMapsLibrary = 'places' | 'geometry' | 'drawing' | 'visualization';

// interface GeoLocationPickerProps {
//   value: string;
//   onChange: (val: string) => void;

//   onAddressDetected?: (address: {
//     city?: string;
//     state?: string;
//     country?: string;
//     pincode?: string;
//   }) => void;

//   onGeoDataChange?: (data: {
//     primaryLocation: { lat: number; lng: number } | null;
//     markers: { lat: number; lng: number }[];
//     polygonPath: { lat: number; lng: number }[];
//     polygonArea: number | null;
//   }) => void;
// }

// const containerStyle = {
//   width: '100%',
//   height: '300px',
// };

// const MAP_LIBRARIES: GoogleMapsLibrary[] = ['places', 'geometry', 'drawing', 'visualization'];

// const darkMapTheme: google.maps.MapTypeStyle[] = [
//   { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
//   { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
//   { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
//   { featureType: 'poi', stylers: [{ visibility: 'off' }] },
//   { featureType: 'road', stylers: [{ color: '#292929' }] },
//   { featureType: 'water', stylers: [{ color: '#0f0f0f' }] },
// ];

// export default function GeoLocationPicker({
//   value,
//   onChange,
//   onAddressDetected,
//   onGeoDataChange,
// }: GeoLocationPickerProps) {
//   const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
//   const polygonRef = useRef<google.maps.Polygon | null>(null);
//   const lastGeoRef = useRef<string>('');

//   const [markerPosition, setMarkerPosition] = useState<{
//     lat: number;
//     lng: number;
//   } | null>(null);

//   const [extraMarkers, setExtraMarkers] = useState<{ lat: number; lng: number }[]>([]);
//   const [polygonPath, setPolygonPath] = useState<{ lat: number; lng: number }[]>([]);
//   const [polygonArea, setPolygonArea] = useState<number | null>(null);
//   const [drawMode, setDrawMode] = useState(false);
//   const [heatmapEnabled, setHeatmapEnabled] = useState(false);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY!,
//     libraries: MAP_LIBRARIES,
//   });

//   /* -------------------- SYNC RHF VALUE -------------------- */
//   useEffect(() => {
//     if (!value) {
//       setMarkerPosition(null);
//       return;
//     }

//     const [lat, lng] = value.split(',').map(Number);
//     if (Number.isNaN(lat) || Number.isNaN(lng)) return;

//     setMarkerPosition({ lat, lng });
//   }, [value]);

//   /* -------------------- REVERSE GEOCODE (SAFE) -------------------- */
//   const reverseGeocode = async (lat: number, lng: number) => {
//     try {
//       const geocoder = new google.maps.Geocoder();
//       const res = await geocoder.geocode({ location: { lat, lng } });
//       if (!res.results?.length) return;

//       const address = res.results[0].address_components;
//       const get = (type: string) => address.find((c) => c.types.includes(type))?.long_name;

//       onAddressDetected?.({
//         city: get('locality') || get('administrative_area_level_2'),
//         state: get('administrative_area_level_1'),
//         country: get('country'),
//         pincode: get('postal_code'),
//       });
//     } catch (err) {
//       console.warn('Reverse geocoding failed:', err);
//     }
//   };

//   /* -------------------- MAP CLICK -------------------- */
//   const handleMapClick = useCallback(
//     (e: google.maps.MapMouseEvent) => {
//       if (!e.latLng) return;

//       const lat = e.latLng.lat();
//       const lng = e.latLng.lng();
//       const dom = e.domEvent as MouseEvent;

//       if (dom.shiftKey) {
//         setExtraMarkers((prev) => [...prev, { lat, lng }]);
//         return;
//       }

//       setMarkerPosition({ lat, lng });
//       onChange(`${lat},${lng}`);
//       reverseGeocode(lat, lng);
//     },
//     [onChange]
//   );

//   /* -------------------- PLACE SEARCH -------------------- */
//   const onPlaceSelected = () => {
//     if (!autocompleteRef.current) return;

//     const place = autocompleteRef.current.getPlace();
//     if (!place.geometry) return;

//     const lat = place.geometry.location!.lat();
//     const lng = place.geometry.location!.lng();

//     setMarkerPosition({ lat, lng });
//     onChange(`${lat},${lng}`);
//     reverseGeocode(lat, lng);
//   };

//   /* -------------------- POLYGON -------------------- */
//   const updatePolygonState = (poly: google.maps.Polygon) => {
//     const path = poly.getPath();
//     const points = path.getArray().map((p) => ({
//       lat: p.lat(),
//       lng: p.lng(),
//     }));

//     const area = google.maps.geometry.spherical.computeArea(path);

//     setPolygonPath(points);
//     setPolygonArea(area);
//   };

//   const handlePolygonComplete = (poly: google.maps.Polygon) => {
//     if (polygonRef.current) {
//       polygonRef.current.setMap(null);
//     }

//     polygonRef.current = poly;
//     updatePolygonState(poly);

//     const path = poly.getPath();
//     const update = () => updatePolygonState(poly);

//     path.addListener('set_at', update);
//     path.addListener('insert_at', update);
//     path.addListener('remove_at', update);

//     setDrawMode(false);
//   };

//   /* -------------------- GEO DATA SYNC (NO LOOP) -------------------- */
//   useEffect(() => {
//     if (!onGeoDataChange) return;

//     const payload = {
//       primaryLocation: markerPosition,
//       markers: extraMarkers,
//       polygonPath,
//       polygonArea,
//     };

//     const serialized = JSON.stringify(payload);
//     if (serialized === lastGeoRef.current) return;

//     lastGeoRef.current = serialized;
//     onGeoDataChange(payload);
//   }, [markerPosition, extraMarkers, polygonPath, polygonArea, onGeoDataChange]);

//   if (!isLoaded) {
//     return <div className="text-white">Loading map…</div>;
//   }

//   const heatmapData = [
//     ...(markerPosition ? [new google.maps.LatLng(markerPosition.lat, markerPosition.lng)] : []),
//     ...extraMarkers.map((m) => new google.maps.LatLng(m.lat, m.lng)),
//   ];

//   /* -------------------- RENDER -------------------- */
//   return (
//     <div className="flex flex-col gap-3">
//       <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={onPlaceSelected}>
//         <input
//           type="text"
//           placeholder="Search building, area, city..."
//           className="w-full px-3 py-2 bg-[#050509] border border-inactive-gray rounded-md text-sm text-white outline-none"
//         />
//       </Autocomplete>

//       <div className="flex gap-2">
//         <button
//           type="button"
//           onClick={() => setDrawMode((d) => !d)}
//           className="px-3 py-2 text-xs bg-[#111827] text-white rounded-md"
//         >
//           {drawMode ? 'Drawing…' : 'Draw Boundary'}
//         </button>

//         <button
//           type="button"
//           onClick={() => setHeatmapEnabled((h) => !h)}
//           className="px-3 py-2 text-xs bg-[#111827] text-white rounded-md"
//         >
//           {heatmapEnabled ? 'Hide Heatmap' : 'Show Heatmap'}
//         </button>
//       </div>

//       <div className="rounded-xl overflow-hidden border border-inactive-gray">
//         <GoogleMap
//           mapContainerStyle={containerStyle}
//           zoom={15}
//           center={markerPosition ?? { lat: 25.2048, lng: 55.2708 }}
//           onClick={handleMapClick}
//           options={{
//             disableDefaultUI: true,
//             styles: darkMapTheme,
//           }}
//         >
//           {markerPosition && <Marker position={markerPosition} />}

//           {extraMarkers.map((m, i) => (
//             <Marker
//               key={i}
//               position={m}
//               icon={{
//                 path: google.maps.SymbolPath.CIRCLE,
//                 scale: 5,
//                 fillColor: '#F59E0B',
//                 fillOpacity: 1,
//                 strokeColor: '#111827',
//                 strokeWeight: 1,
//               }}
//             />
//           ))}

//           {drawMode && (
//             <DrawingManager
//               drawingMode={google.maps.drawing.OverlayType.POLYGON}
//               onPolygonComplete={handlePolygonComplete}
//               options={{
//                 drawingControl: false,
//                 polygonOptions: {
//                   fillColor: '#2563EB',
//                   fillOpacity: 0.25,
//                   strokeColor: '#60A5FA',
//                   strokeWeight: 2,
//                   editable: true,
//                 },
//               }}
//             />
//           )}

//           {heatmapEnabled && heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
//         </GoogleMap>
//       </div>
//     </div>
//   );
// }

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

const MAP_LIBRARIES: GoogleMapsLibrary[] = ['places', 'geometry', 'drawing', 'visualization'];

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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const lastGeoRef = useRef<string>('');

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [extraMarkers, setExtraMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [polygonPath, setPolygonPath] = useState<{ lat: number; lng: number }[]>([]);
  const [polygonArea, setPolygonArea] = useState<number | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY!,
    libraries: MAP_LIBRARIES,
  });

  /* -------------------- Sync RHF value -------------------- */
  useEffect(() => {
    if (!value) {
      setMarkerPosition((prev) => (prev ? null : prev));
      return;
    }

    const parts = value.split(',').map((v) => Number(v.trim()));
    if (parts.length !== 2) return;

    const lat = parts[0];
    const lng = parts[1];

    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return;
    }

    setMarkerPosition((prev) => {
      if (prev?.lat === lat && prev?.lng === lng) return prev;
      return { lat, lng };
    });
  }, [value]);

  /* -------------------- Reverse Geocode (safe) -------------------- */
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const res = await geocoder.geocode({ location: { lat, lng } });

      const result = res.results?.[0];
      if (!result) return;

      const address = result.address_components;
      const get = (type: string) => address.find((c) => c.types.includes(type))?.long_name;

      onAddressDetected?.({
        city: get('locality') || get('administrative_area_level_2'),
        state: get('administrative_area_level_1'),
        country: get('country'),
        pincode: get('postal_code'),
      });
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
    }
  };

  /* -------------------- Map click -------------------- */
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const dom = e.domEvent as MouseEvent;

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

  /* -------------------- Place search -------------------- */
  const onPlaceSelected = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    const location = place.geometry?.location;
    if (!location) return;

    const lat = location.lat();
    const lng = location.lng();

    setMarkerPosition({ lat, lng });
    onChange(`${lat},${lng}`);
    reverseGeocode(lat, lng);
  };

  /* -------------------- Polygon handling -------------------- */
  const updatePolygonState = (poly: google.maps.Polygon) => {
    const path = poly.getPath();
    const points = path.getArray().map((p) => ({
      lat: p.lat(),
      lng: p.lng(),
    }));

    const area = google.maps.geometry.spherical.computeArea(path);

    setPolygonPath(points);
    setPolygonArea(area);
  };

  const handlePolygonComplete = (poly: google.maps.Polygon) => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    polygonRef.current = poly;
    updatePolygonState(poly);

    const path = poly.getPath();
    const update = () => updatePolygonState(poly);

    path.addListener('set_at', update);
    path.addListener('insert_at', update);
    path.addListener('remove_at', update);

    setDrawMode(false);
  };

  /* -------------------- Geo sync (no loop) -------------------- */
  useEffect(() => {
    if (!onGeoDataChange) return;

    const payload = {
      primaryLocation: markerPosition,
      markers: extraMarkers,
      polygonPath,
      polygonArea,
    };

    const serialized = JSON.stringify(payload);
    if (serialized === lastGeoRef.current) return;

    lastGeoRef.current = serialized;
    onGeoDataChange(payload);
  }, [markerPosition, extraMarkers, polygonPath, polygonArea, onGeoDataChange]);

  if (!isLoaded) {
    return <div className="text-white">Loading map…</div>;
  }

  const heatmapData = [
    ...(markerPosition ? [new google.maps.LatLng(markerPosition.lat, markerPosition.lng)] : []),
    ...extraMarkers.map((m) => new google.maps.LatLng(m.lat, m.lng)),
  ];

  /* -------------------- Render -------------------- */
  return (
    <div className="flex flex-col gap-3">
      <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={onPlaceSelected}>
        <input
          type="text"
          placeholder="Search building, area, city..."
          className="w-full px-3 py-2 bg-[#050509] border border-inactive-gray rounded-md text-sm text-white outline-none"
        />
      </Autocomplete>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDrawMode((d) => !d)}
          className="px-3 py-2 text-xs bg-[#111827] text-white rounded-md"
        >
          {drawMode ? 'Drawing…' : 'Draw Boundary'}
        </button>

        <button
          type="button"
          onClick={() => setHeatmapEnabled((h) => !h)}
          className="px-3 py-2 text-xs bg-[#111827] text-white rounded-md"
        >
          {heatmapEnabled ? 'Hide Heatmap' : 'Show Heatmap'}
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border border-inactive-gray">
        <GoogleMap
          mapContainerStyle={containerStyle}
          zoom={15}
          center={markerPosition ?? { lat: 25.2048, lng: 55.2708 }}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            styles: darkMapTheme,
          }}
        >
          {markerPosition && <Marker position={markerPosition} />}

          {extraMarkers.map((m, i) => (
            <Marker
              key={i}
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
              drawingMode={google.maps.drawing.OverlayType.POLYGON}
              onPolygonComplete={handlePolygonComplete}
              options={{
                drawingControl: false,
                polygonOptions: {
                  fillColor: '#2563EB',
                  fillOpacity: 0.25,
                  strokeColor: '#60A5FA',
                  strokeWeight: 2,
                  editable: true,
                },
              }}
            />
          )}

          {heatmapEnabled && heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
        </GoogleMap>
      </div>
    </div>
  );
}
