import { useEffect, useRef, useState } from "react";

import { loadGoogleMapsScript } from "../utils/googleMaps";

const geocodeAddress = (address) => {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { address: address + ", Nigeria" },
      (results, status) => {
        if (status === "OK" && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          reject(new Error("Could not find location: " + address));
        }
      }
    );
  });
};

export default function ActiveDeliveryMap({ order }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        if (!isMounted || !mapRef.current) return;

        // ── Resolve pickup coordinates ──────────────────────────
        let pickupCoords = order.pickupCoords?.lat
          ? order.pickupCoords
          : null;

        if (!pickupCoords) {
          const address = order.businessId?.restaurantLocation;
          if (!address) throw new Error("No pickup address found");
          pickupCoords = await geocodeAddress(address);
        }

        // ── Resolve dropoff coordinates ─────────────────────────
        let dropoffCoords = order.deliveryCoords?.lat
          ? order.deliveryCoords
          : null;

        if (!dropoffCoords) {
          if (!order.deliveryAddress) throw new Error("No delivery address found");
          dropoffCoords = await geocodeAddress(order.deliveryAddress);
        }

        if (!isMounted || !mapRef.current) return;

        // ── Initialize map ──────────────────────────────────────
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: pickupCoords,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          ],
        });

        mapInstanceRef.current = map;

        // ── Pickup pin (orange — business location) ─────────────
        new window.google.maps.Marker({
          position: pickupCoords,
          map,
          title: order.businessId?.restaurantName || "Pickup",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#F97316",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          label: {
            text: "P",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: "bold",
          },
        });

        // ── Dropoff pin (green — customer address) ──────────────
        new window.google.maps.Marker({
          position: dropoffCoords,
          map,
          title: order.deliveryAddress || "Dropoff",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#22c55e",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          label: {
            text: "D",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: "bold",
          },
        });

        // ── Draw route between pickup and dropoff ───────────────
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#F97316",
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        });

        directionsRendererRef.current = directionsRenderer;

        directionsService.route(
          {
            origin: pickupCoords,
            destination: dropoffCoords,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (!isMounted) return;
            if (status === "OK") {
              directionsRenderer.setDirections(result);
              const leg = result.routes[0].legs[0];
              setRouteInfo({
                distance: leg.distance.text,
                duration: leg.duration.text,
              });
            }
            setLoading(false);
          }
        );
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [order?._id]);

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-white/10">

      {/* Map container */}
      <div ref={mapRef} style={{ height: "220px", width: "100%" }} />

      {/* Info strip below map */}
      <div className="bg-[#0D0D0D] px-4 py-3">
        {loading && (
          <div className="flex items-center gap-2 text-white/40">
            <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            <span className="text-xs">Calculating route...</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        {routeInfo && !loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-white/40">Distance</p>
                <p className="text-sm font-bold text-white">{routeInfo.distance}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Est. time</p>
                <p className="text-sm font-bold text-[#F97316]">{routeInfo.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F97316] inline-block" />
                Pickup
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Dropoff
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}