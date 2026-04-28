import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractCityFromAddress(address: string | null): string | null {
  if (!address) return null;
  
  // Ex: "Alameda Dr. Octávio do Amaral, 439 - Água Verde, Curitiba - PR, 80430-160"
  // Ex: "Holambra - SP, 13825-000, Brazil"
  
  const parts = address.split(',').map(p => p.trim());
  
  // 1. Look for "City - ST" pattern
  for (const part of parts) {
    const match = part.match(/^([^0-9-]+)\s*-\s*[A-Z]{2}$/i);
    if (match) return match[1].trim();
  }
  
  // 2. Simple format usually has City in the second to last position if the last is short
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    // If last part is zip or country or short state
    if (last.length <= 8 || last.toLowerCase() === 'brazil' || last.toLowerCase() === 'brasil') {
       // Check the part before
       const cityCandidate = parts[parts.length - 2];
       if (cityCandidate && !cityCandidate.includes('-')) {
         return cityCandidate;
       }
    }
  }

  return null;
}
