// Routes = a launch site + a destination. Everything a destination needs lives in DESTINATIONS,
// so adding one = one entry here (+ its land polygons in tools/build_targets.py if new).
// Latitudes are treated as geocentric on a spherical Earth (< 0.2° from geodetic, stated).
import type { TargetKey } from "./geo";

export type SceneKey = "farm" | "au-farm";
export type FoodKey = "cheese" | "matcha" | "croissant" | "corn" | "pancakes" | "milkshake";
export type BackdropKey = "hills" | "mountain" | "vineyard" | "palms" | "maple" | "barn";

export interface Ending { title: string; tag: string; food: FoodKey; backdrop: BackdropKey; dance?: boolean }
export interface City {
  id: string; kind: "dest" | "classic";
  name: string; country: string; lat: number; lon: number; blurb: string;
  scene: SceneKey; target: TargetKey; signText: string; stars?: number; ending: Ending;
}

/** The one fictional home farm for every destination (rural western Victoria, Australia). */
export const HOME_FARM = { name: "Home farm, Australia", lat: -38.2, lon: 142.9 };

const dest = (id: string, target: TargetKey, place: string, blurb: string, stars: number, ending: Ending): City => ({
  id, kind: "dest", name: place, country: "Australia", lat: HOME_FARM.lat, lon: HOME_FARM.lon, blurb, scene: "au-farm", target, signText: place.toUpperCase(), stars, ending,
});

// Ordered easiest → hardest by the share of (direction, angle, power) settings that land in
// the destination within 2 h of flight (tests/validate.ts playability sweep).
export const DESTINATIONS: City[] = [
  dest("d-ca", "CA", "Canada", "Maple leaves and pancakes with syrup.", 1,
    { title: "HELLO, CANADA!", tag: "Under the maple trees: pancakes with maple syrup.", food: "pancakes", backdrop: "maple" }),
  dest("d-br", "BR", "Brazil", "Grilled-corn party. Dancing is mandatory.", 1,
    { title: "PARTY TIME!", tag: "Grilled corn, music, and a herd that can really dance.", food: "corn", backdrop: "palms", dance: true }),
  dest("d-nz", "NZ", "New Zealand", "Join the herd in the green paddocks. Cheese for everyone.", 2,
    { title: "KIA ORA!", tag: "Joined the herd on the grass. Cheese time.", food: "cheese", backdrop: "hills" }),
  dest("d-jp", "JP", "Japan", "Join a farm herd. Matcha ice cream on arrival.", 3,
    { title: "WELCOME TO JAPAN!", tag: "The farm herd saved you a matcha ice cream.", food: "matcha", backdrop: "mountain" }),
  dest("d-fr", "FR", "France", "Croissants, cheese and grape juice with the local herd.", 3,
    { title: "BONJOUR!", tag: "The herd laid out croissants, cheese and grape juice.", food: "croissant", backdrop: "vineyard" }),
];

const AUS: Ending = { title: "G'DAY, MATE!", tag: "Welcome party! The local herd brought milkshakes.", food: "milkshake", backdrop: "barn" };
export const CLASSIC: City[] = [
  { id: "taipei", kind: "classic", name: "Taipei", country: "Taiwan", lat: 25.03, lon: 121.56, blurb: "Short hop. Good for learning.", scene: "farm", target: "AU", signText: "TAIPEI", ending: AUS },
  { id: "capetown", kind: "classic", name: "Cape Town", country: "South Africa", lat: -33.92, lon: 18.42, blurb: "Straight across the Indian Ocean.", scene: "farm", target: "AU", signText: "CAPE TOWN", ending: AUS },
  { id: "london", kind: "classic", name: "London", country: "UK", lat: 51.507, lon: -0.128, blurb: "Long haul. Very touchy fart.", scene: "farm", target: "AU", signText: "LONDON", ending: AUS },
  { id: "newyork", kind: "classic", name: "New York", country: "USA", lat: 40.71, lon: -74.01, blurb: "Over the top of the world?", scene: "farm", target: "AU", signText: "NEW YORK", ending: AUS },
  { id: "bermuda", kind: "classic", name: "Bermuda", country: "UK territory", lat: 32.29, lon: -64.78, blurb: "Opposite side of the planet from Perth. Hardest one.", scene: "farm", target: "AU", signText: "BERMUDA", ending: AUS },
];

export const CITIES: City[] = [...DESTINATIONS, ...CLASSIC];
