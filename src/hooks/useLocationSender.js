import { useEffect, useRef } from "react";
import api from "../services/api";

export default function useLocationSender(isActiveDelivery) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActiveDelivery) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const sendLocation = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          api.patch("/rider/location", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    sendLocation();
    intervalRef.current = setInterval(sendLocation, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActiveDelivery]);
}