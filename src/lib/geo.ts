export function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const miles = calculateDistanceMiles(lat1, lon1, lat2, lon2);
  return Math.round(miles * 1.60934 * 10) / 10;
}

export const POPULAR_LOCATIONS = [
  { city: 'Albuquerque', region: 'New Mexico, USA', lat: 35.0844, lng: -106.6504 },
  { city: 'Denver', region: 'Colorado, USA', lat: 39.7392, lng: -104.9903 },
  { city: 'Roswell', region: 'New Mexico, USA', lat: 33.3943, lng: -104.5230 },
  { city: 'San Diego', region: 'California, USA', lat: 32.7157, lng: -117.1611 },
  { city: 'Skinwalker Ranch', region: 'Utah, USA', lat: 40.2589, lng: -109.8925 },
  { city: 'Los Angeles', region: 'California, USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Mojave Desert', region: 'California, USA', lat: 35.0110, lng: -115.4734 },
  { city: 'Chicago', region: 'Illinois, USA', lat: 41.8781, lng: -87.6298 },
  { city: 'London', region: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { city: 'Tokyo', region: 'Japan', lat: 35.6762, lng: 139.6503 },
  { city: 'Pine Gap', region: 'Northern Territory, Australia', lat: -23.7990, lng: 133.7370 },
  { city: 'Gulf of Mexico', region: 'Offshore Sector', lat: 27.5000, lng: -90.0000 }
];
