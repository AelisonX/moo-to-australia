// Fixed launch sites for v0.1. Latitudes treated as geocentric on a spherical Earth
// (difference from geodetic is < 0.2°, ~20 km — acceptable and stated).
export interface City { id: string; name: string; country: string; lat: number; lon: number; blurb: string }
export const CITIES: City[] = [
  { id: "taipei", name: "Taipei", country: "Taiwan", lat: 25.03, lon: 121.56, blurb: "Short hop. Good for learning." },
  { id: "capetown", name: "Cape Town", country: "South Africa", lat: -33.92, lon: 18.42, blurb: "Straight across the Indian Ocean." },
  { id: "london", name: "London", country: "UK", lat: 51.507, lon: -0.128, blurb: "Long haul. Very touchy fart." },
  { id: "newyork", name: "New York", country: "USA", lat: 40.71, lon: -74.01, blurb: "Over the top of the world?" },
  { id: "bermuda", name: "Bermuda", country: "UK territory", lat: 32.29, lon: -64.78, blurb: "Opposite side of the planet from Perth. Hardest one." },
];
