//api/search/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Check if OpenAI API key is present
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { city, hotel } = await req.json();

    // Validate input
    if (!city || !hotel) {
      return NextResponse.json(
        { error: 'City and hotel name are required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that finds hotel contact information."
        },
        {
          role: "user",
          content: `Find the phone number for ${hotel} in ${city}. Return only the phone number in international format.`
        }
      ],
    });

    const phoneNumber = completion.choices[0].message.content;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Could not find phone number' },
        { status: 404 }
      );
    }

    return NextResponse.json({ phoneNumber });
  } catch (error) {
    console.error('OpenAI search error:', error);
    return NextResponse.json(
      { error: 'Failed to search hotel' },
      { status: 500 }
    );
  }
}