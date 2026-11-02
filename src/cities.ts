// Routes = a launch site + a target country.
// "tour" = the five World Tour levels; "classic" = any farm → Australia.
// Latitudes are treated as geocentric on a spherical Earth (< 0.2° from geodetic, stated).
import type { TargetKey } from "./geo";

export type SceneKey = "farm" | "tw-farm" | "steppe" | "au-farm" | "fr-farm" | "nz-farm";
export type CelebrateKey = "milkshake" | "cheese-picnic" | "croissant" | "fondue" | "bubble-tea" | "none";

export interface City {
  id: string; kind: "tour" | "classic"; level?: number;
  name: string; country: string; lat: number; lon: number; blurb: string;
  scene: SceneKey; target: TargetKey; celebrate: CelebrateKey; signText: string;
}

export const TOUR: City[] = [
  { id: "t1", kind: "tour", level: 1, name: "Taiwan farm", country: "Taiwan", lat: 24.05, lon: 121.16, scene: "tw-farm", target: "AU", celebrate: "milkshake", signText: "TAIWAN", blurb: "Taiwan → Australia. Milkshakes on arrival." },
  { id: "t2", kind: "tour", level: 2, name: "Mongolian steppe", country: "Mongolia", lat: 47.7, lon: 106.3, scene: "steppe", target: "NZ", celebrate: "cheese-picnic", signText: "MONGOLIA", blurb: "Steppe → New Zealand. Cheese picnic with the herd." },
  { id: "t3", kind: "tour", level: 3, name: "Australian farm", country: "Australia", lat: -38.2, lon: 142.9, scene: "au-farm", target: "FR", celebrate: "croissant", signText: "AUSTRALIA", blurb: "Australia → France. Cheese and croissants." },
  { id: "t4", kind: "tour", level: 4, name: "French farm", country: "France", lat: 49.1, lon: -0.7, scene: "fr-farm", target: "CH", celebrate: "fondue", signText: "FRANCE", blurb: "France → Switzerland. Fondue in the Alps." },
  { id: "t5", kind: "tour", level: 5, name: "New Zealand farm", country: "New Zealand", lat: -37.9, lon: 175.4, scene: "nz-farm", target: "TW", celebrate: "bubble-tea", signText: "NZ", blurb: "New Zealand → home to Taiwan. Bubble tea!" },
];

export const CLASSIC: City[] = [
  { id: "taipei", kind: "classic", name: "Taipei", country: "Taiwan", lat: 25.03, lon: 121.56, blurb: "Short hop. Good for learning.", scene: "farm", target: "AU", celebrate: "milkshake", signText: "TAIPEI" },
  { id: "capetown", kind: "classic", name: "Cape Town", country: "South Africa", lat: -33.92, lon: 18.42, blurb: "Straight across the Indian Ocean.", scene: "farm", target: "AU", celebrate: "milkshake", signText: "CAPE TOWN" },
  { id: "london", kind: "classic", name: "London", country: "UK", lat: 51.507, lon: -0.128, blurb: "Long haul. Very touchy fart.", scene: "farm", target: "AU", celebrate: "milkshake", signText: "LONDON" },
  { id: "newyork", kind: "classic", name: "New York", country: "USA", lat: 40.71, lon: -74.01, blurb: "Over the top of the world?", scene: "farm", target: "AU", celebrate: "milkshake", signText: "NEW YORK" },
  { id: "bermuda", kind: "classic", name: "Bermuda", country: "UK territory", lat: 32.29, lon: -64.78, blurb: "Opposite side of the planet from Perth. Hardest one.", scene: "farm", target: "AU", celebrate: "milkshake", signText: "BERMUDA" },
];

export const CITIES: City[] = [...TOUR, ...CLASSIC];
