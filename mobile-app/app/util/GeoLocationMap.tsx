import { useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";

interface Props {
    onChange: (val: string) => void;
}

const GeoLocationMap: React.FC<Props> = ({ onChange }) => {
    const mapRef = useRef<MapView>(null);

    const [region, setRegion] = useState({
        latitude: 22.7620367,
        longitude: 75.8667285,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    useEffect(() => {
        requestLocation();
    }, []);

    const requestLocation = async () => {
        try {
            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    return;
                }
            }

            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    const newRegion = {
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };

                    setRegion(newRegion);
                    onChange(`${latitude}, ${longitude}`);

                    mapRef.current?.animateToRegion(newRegion, 1000);
                },
                (error) => {
                    console.log("Location error:", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                }
            );
        } catch (err) {
            console.log("Permission error:", err);
        }
    };

    return (
        <View style={{ height: 180, borderRadius: 8, overflow: "hidden" }}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                mapType="satellite"
                region={region}
                onPress={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setRegion({ ...region, latitude, longitude });
                    onChange(`${latitude}, ${longitude}`);
                }}
            >
                <Marker coordinate={region} />
            </MapView>
        </View>
    );
};

export default GeoLocationMap;