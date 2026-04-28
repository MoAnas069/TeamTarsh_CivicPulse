/* ============================================
   CivicPulse — Geolocation Utilities
   ============================================ */

/**
 * Get current position via browser Geolocation API
 * Returns { lat, lng }
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enter your address manually.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable. Please enter your address manually.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again or enter manually.'));
            break;
          default:
            reject(new Error('An unknown error occurred while getting your location.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Reverse geocode coordinates to an address using Nominatim (OSM)
 * Returns address string
 */
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data.display_name) {
      // Build a shorter, cleaner address
      const addr = data.address || {};
      const parts = [];

      if (addr.house_number && addr.road) {
        parts.push(`${addr.house_number} ${addr.road}`);
      } else if (addr.road) {
        parts.push(addr.road);
      }

      if (addr.suburb || addr.neighbourhood) {
        parts.push(addr.suburb || addr.neighbourhood);
      }

      if (addr.city || addr.town || addr.village) {
        parts.push(addr.city || addr.town || addr.village);
      }

      return parts.length > 0 ? parts.join(', ') : data.display_name;
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Search for a location by address string using Nominatim
 * Returns array of { lat, lng, address }
 */
export async function searchLocation(query) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.map(item => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.display_name,
    }));
  } catch {
    return [];
  }
}
