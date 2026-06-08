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

// Custom house SVG icon for the customer delivery pin
const CUSTOMER_HOUSE_ICON = {
  url:
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
        <!-- Drop-shadow -->
        <ellipse cx="22" cy="50" rx="9" ry="3" fill="rgba(0,0,0,0.25)" />
        <!-- Balloon body -->
        <path d="M22 2 C10 2 2 10 2 20 C2 32 22 48 22 48 C22 48 42 32 42 20 C42 10 34 2 22 2 Z"
              fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
        <!-- House shape (white) -->
        <g transform="translate(22,19)">
          <!-- Roof -->
          <polygon points="-9,-8 0,-15 9,-8" fill="white"/>
          <!-- Body -->
          <rect x="-7" y="-8" width="14" height="11" rx="1" fill="white"/>
          <!-- Door -->
          <rect x="-3" y="-1" width="6" height="7" rx="1" fill="#22c55e"/>
        </g>
      </svg>
    `),
  scaledSize: { width: 44, height: 52 },   // applied after Maps loads
  anchor: { x: 22, y: 48 },
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

        // ── Pickup pin (orange circle — business location) ──────
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

        // ── Customer delivery pin (green house icon) ────────────
        new window.google.maps.Marker({
          position: dropoffCoords,
          map,
          title: order.deliveryAddress || "Customer location",
          icon: {
            url: CUSTOMER_HOUSE_ICON.url,
            scaledSize: new window.google.maps.Size(44, 52),
            anchor: new window.google.maps.Point(22, 48),
          },
          // Tooltip-style info window on click
          zIndex: 10,
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
                Customer
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}