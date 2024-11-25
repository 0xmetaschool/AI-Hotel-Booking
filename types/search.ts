//types/search.ts

export interface City {
    name: string;
    country: string;
    region: string;
    id: string;
    boundingbox: string[];
    lat: string;
    lon: string;
  }
  
  export interface Hotel {
    name: string;
    address: string;
    phone: string;
    website?: string;
    stars?: number;
    type: string;
    rating?: number;
    rooms?: number;
    id: string;
    location: {
      lat: number | null;
      lon: number | null;
    };
  }
  
  export interface SearchState {
    city: string;
    selectedCity: City | null;
    hotel: string;
    phone: string;
    step: number;
    isLoading: boolean;
    citySuggestions: City[];
    hotelSuggestions: Hotel[];
    showCitySuggestions: boolean;
    showHotelSuggestions: boolean;
    isCityLoading: boolean;
    isHotelLoading: boolean;
    error: string;
  }