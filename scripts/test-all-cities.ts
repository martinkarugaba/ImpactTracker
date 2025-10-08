import type { City } from "all-the-cities";
import cities from "all-the-cities";

// Filter cities in Uganda
const ugandaCities = cities.filter((city: City) => city.country === "UG");

console.log(`Found ${ugandaCities.length} cities in Uganda`);
console.log("\nFirst few cities:", ugandaCities.slice(0, 5));

// Group cities by district (state)
const citiesByDistrict = ugandaCities.reduce<Record<string, City[]>>(
  (acc, city) => {
    const district = city.state || "Unknown";
    if (!acc[district]) {
      acc[district] = [];
    }
    acc[district].push(city);
    return acc;
  },
  {}
);

console.log("\nCities by district:");
Object.entries(citiesByDistrict).forEach(([district, districtCities]) => {
  console.log(`\n${district}: ${districtCities.length} cities`);
  console.log(
    "Sample cities:",
    districtCities.slice(0, 3).map((c: City) => c.name)
  );
});
