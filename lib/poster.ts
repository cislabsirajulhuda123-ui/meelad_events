import type { Event } from "./model";

export const posterCategories = [
  { key: "HIGH_SCHOOL", label: "High School" },
  { key: "UPPER_PRIMARY", label: "Upper Primary" },
  { key: "LOWER_PRIMARY", label: "Lower Primary" },
  { key: "KIDS", label: "Kids" },
] as const;

export function posterCategoryKey(zone: Event["zone"]) {
  if (zone === "HI_ZONE_CAMPUS" || zone === "HI_ZONE_INTER")
    return "HIGH_SCHOOL";
  if (zone === "D_ZONE") return "UPPER_PRIMARY";
  if (zone === "P_ZONE") return "LOWER_PRIMARY";
  if (zone === "KIDS") return "KIDS";
  return null;
}

export function posterContentKey(category: string) {
  return `poster-template:${category}`;
}
