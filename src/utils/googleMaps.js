let isLoading = false;
let isLoaded = false;
const callbacks = [];

export const loadGoogleMapsScript = () => {
  return new Promise((resolve) => {
    if (isLoaded) return resolve();
    callbacks.push(resolve);
    if (isLoading) return;
    isLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      callbacks.forEach(cb => cb());
      callbacks.length = 0;
    };
    document.head.appendChild(script);
  });
};