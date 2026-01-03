import { getCode, getName, getNames } from "country-list";
export interface Country {
  name: string;
  code: string;
}

export function getAllCountries(): Country[] {
  const names = getNames();
  return names.map((name: string) => ({
    name,
    code: getCode(name) || "",
  }));
}

export function getCountryNameByCode(code: string): string {
  return getName(code) || code;
}

export function getCountryFlagEmoji(code: string): string {
  return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${code.toUpperCase()}.svg`;
}
