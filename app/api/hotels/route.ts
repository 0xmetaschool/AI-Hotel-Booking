//api/hotels/route.ts

import { NextResponse } from 'next/server';

// Define interfaces for type safety
interface Location {
  lat: number | null;
  lon: number | null;
}

interface Hotel {
  name: string;
  address: string;
  phone: string;
  website?: string;
  stars: number | null;
  type: string;
  rating: number | null;
  rooms: number | null;
  id: string;
  location: Location;
}

interface OSMElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    phone?: string;
    'contact:phone'?: string;
    website?: string;
    'contact:website'?: string;
    stars?: string;
    tourism?: string;
    rating?: string;
    rooms?: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const query = searchParams.get('query');

  if (!city || !query) {
    return NextResponse.json({ hotels: [] });
  }

  try {
    // First get the city coordinates from Nominatim
    const cityResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
      {
        headers: {
          'User-Agent': 'HotelFinder/1.0'
        }
      }
    );

    const cityData = await cityResponse.json();
    
    if (!cityData[0]) {
      return NextResponse.json({ hotels: [] });
    }

    const { lat, lon, boundingbox } = cityData[0];

    // Use the city's coordinates to find hotels within its boundaries
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"="hotel"]["name"~"${query}", i]
          (${boundingbox[0]},${boundingbox[2]},${boundingbox[1]},${boundingbox[3]});
        way["tourism"="hotel"]["name"~"${query}", i]
          (${boundingbox[0]},${boundingbox[2]},${boundingbox[1]},${boundingbox[3]});
        node["tourism"="guest_house"]["name"~"${query}", i]
          (${boundingbox[0]},${boundingbox[2]},${boundingbox[1]},${boundingbox[3]});
        way["tourism"="guest_house"]["name"~"${query}", i]
          (${boundingbox[0]},${boundingbox[2]},${boundingbox[1]},${boundingbox[3]});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await fetch(
      'https://overpass-api.de/api/interpreter',
      {
        method: 'POST',
        body: overpassQuery
      }
    );

    const data = await response.json();
    
    // Process and clean the data with proper typing
    const hotels: Hotel[] = data.elements
      .filter((element: OSMElement) => element.tags && element.tags.name)
      .map((element: OSMElement): Hotel => ({
        name: element.tags?.name || '',
        address: element.tags?.['addr:street'] 
          ? `${element.tags['addr:street']} ${element.tags['addr:housenumber'] || ''}, ${city}`
          : `${city}`,
        phone: element.tags?.phone || element.tags?.['contact:phone'] || '',
        website: element.tags?.website || element.tags?.['contact:website'],
        stars: element.tags?.stars ? Number(element.tags.stars) : null,
        type: element.tags?.tourism || 'hotel',
        rating: element.tags?.rating ? Number(element.tags.rating) : null,
        rooms: element.tags?.rooms ? Number(element.tags.rooms) : null,
        id: element.id.toString(),
        location: {
          lat: element.lat || element.center?.lat || null,
          lon: element.lon || element.center?.lon || null
        }
      }))
      .filter((hotel: Hotel) => 
        // Ensure the hotel has a name and is actually in the requested city
        hotel.name.toLowerCase().includes(query.toLowerCase()) && 
        hotel.address.toLowerCase().includes(city.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 results

    return NextResponse.json({ hotels });
  } catch (error) {
    console.error('Hotel search error:', error);
    return NextResponse.json({ hotels: [] });
  }
}