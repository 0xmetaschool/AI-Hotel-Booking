//api/voice-webhook/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get('assistantId');
    const threadId = searchParams.get('threadId');
    
    const body = await request.json();
    const { SpeechResult } = body;

    if (!assistantId || !threadId) {
      throw new Error('Missing assistant or thread ID');
    }

    // Add the human's message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: SpeechResult
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });

    // Wait for the assistant's response
    let response = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (response.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      response = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Get the assistant's latest message
    const messages = await openai.beta.threads.messages.list(threadId);
    const latestMessage = messages.data[0].content[0];
    
    // Check if the content is text
    const messageText = 'text' in latestMessage && latestMessage.type === 'text' 
      ? latestMessage.text.value 
      : 'I apologize, but I encountered an error processing the response.';

    // Convert the assistant's response to speech using Twilio's <Say> verb
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Amy-Neural">
          ${messageText}
        </Say>
      </Response>`,
      {
        headers: {
          'Content-Type': 'application/xml'
        }
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>I apologize, but I encountered an error. Please try again.</Say>
      </Response>`,
      {
        headers: {
          'Content-Type': 'application/xml'
        }
      }
    );
  }
}