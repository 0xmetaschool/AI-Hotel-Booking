//api/scrape-phone/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { hotel, city } = await request.json();

    // Search Google for the hotel's phone number
    const searchQuery = `${hotel} ${city} phone number`;
    const response = await fetch(
      `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

    const text = await response.text();
    
    // Simple regex to find phone numbers
    const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const matches = text.match(phoneRegex);

    if (matches && matches.length > 0) {
      return NextResponse.json({ phoneNumber: matches[0] });
    }

    return NextResponse.json({ phoneNumber: null });
  } catch (error) {
    console.error('Phone scraping error:', error);
    return NextResponse.json({ phoneNumber: null });
  }
}