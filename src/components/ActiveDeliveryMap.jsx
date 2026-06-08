import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function ActiveDeliveryMap({ order }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const [error, setError] = useState(null);
  const [riderCoords, setRiderCoords] = useState(null);

  // Request rider GPS once
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRiderCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setError("Could not get your location. Please enable GPS."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [order?._id]);

  // Build map once riderCoords is available
  useEffect(() => {
    if (!riderCoords || !mapRef.current || !order) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const dropoffCoords = order.deliveryCoords?.lat
      ? [order.deliveryCoords.lat, order.deliveryCoords.lng]
      : null;

    const riderLatLng = [riderCoords.lat, riderCoords.lng];

    const map = L.map(mapRef.current, {
      center: riderLatLng,
      zoom: 15,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" }
    ).addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { attribution: "" }
    ).addTo(map);

    // Rider pin (blue dot)
    const riderIcon = L.divIcon({
      className: "",
      html: `<div style="
        width:18px;height:18px;border-radius:50%;
        background:#3B82F6;border:3px solid white;
        box-shadow:0 0 0 4px rgba(59,130,246,0.3);
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    const riderMarker = L.marker(riderLatLng, { icon: riderIcon })
      .addTo(map)
      .bindTooltip("You", { permanent: true, direction: "top", offset: [0, -10] });

    riderMarkerRef.current = riderMarker;

    // Customer house pin
    if (dropoffCoords) {
      const houseIcon = L.divIcon({
        className: "",
        html: `<div style="width:44px;height:52px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
            <ellipse cx="22" cy="50" rx="9" ry="3" fill="rgba(0,0,0,0.25)"/>
            <path d="M22 2 C10 2 2 10 2 20 C2 32 22 48 22 48 C22 48 42 32 42 20 C42 10 34 2 22 2 Z"
                  fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
            <g transform="translate(22,19)">
              <polygon points="-9,-8 0,-15 9,-8" fill="white"/>
              <rect x="-7" y="-8" width="14" height="11" rx="1" fill="white"/>
              <rect x="-3" y="-1" width="6" height="7" rx="1" fill="#22c55e"/>
            </g>
          </svg>
        </div>`,
        iconSize: [44, 52],
        iconAnchor: [22, 48],
      });

      L.marker(dropoffCoords, { icon: houseIcon })
        .addTo(map)
        .bindTooltip(order.deliveryAddress || "Customer", { permanent: false });

      // Dashed line rider → customer
      L.polyline([riderLatLng, dropoffCoords], {
        color: "#F97316",
        weight: 4,
        opacity: 0.8,
        dashArray: "8, 6",
      }).addTo(map);

      map.fitBounds([riderLatLng, dropoffCoords], { padding: [40, 40] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [riderCoords, order?._id]);

  // Live update rider dot every 10s
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLatLng = [pos.coords.latitude, pos.coords.longitude];
        setRiderCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng(newLatLng);
        }
      },
      null,
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [order?._id]);

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
      {error ? (
        <div className="h-[220px] bg-gray-100 flex items-center justify-center px-4">
          <p className="text-xs text-red-400 text-center">{error}</p>
        </div>
      ) : !riderCoords ? (
        <div className="h-[220px] bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400">Getting your location…</p>
          </div>
        </div>
      ) : (
        <div ref={mapRef} style={{ height: "220px", width: "100%" }} />
      )}
      <div className="bg-[#0D0D0D] px-4 py-3 flex items-center gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          You
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          Customer
        </span>
      </div>
    </div>
  );
}