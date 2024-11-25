//api/cities/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    // Using OpenStreetMap's Nominatim API with specific city-related parameters
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` + 
      `format=json&` +
      `q=${encodeURIComponent(query)}&` +
      `addressdetails=1&` +
      `limit=5&` +
      `featuretype=city&` +
      `type=city,town,village&` + // Only return cities, towns, and villages
      `dedupe=1`, // Remove duplicates
      {
        headers: {
          'User-Agent': 'HotelFinder/1.0'
        }
      }
    );

    const data = await response.json();
    
    const cities = data
      .filter((item: any) => 
        // Ensure we only get cities/towns
        item.type === 'city' || 
        item.type === 'town' || 
        item.type === 'administrative'
      )
      .map((item: any) => ({
        name: item.address.city || item.address.town || item.address.village || item.display_name.split(',')[0],
        country: item.address.country,
        region: item.address.state || item.address.county || '',
        id: item.place_id,
        boundingbox: item.boundingbox,
        lat: item.lat,
        lon: item.lon
      }));

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('City search error:', error);
    return NextResponse.json({ cities: [] });
  }
}