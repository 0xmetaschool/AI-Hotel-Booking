import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WebSocket, RawData } from 'ws';
import { Readable } from 'stream';

interface CustomWebSocket extends WebSocket {
  send(data: string | Buffer | ArrayBuffer | Buffer[]): void;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assistantId = searchParams.get('assistantId');
  const threadId = searchParams.get('threadId');

  if (!assistantId || !threadId) {
    return new Response('Missing parameters', { status: 400 });
  }

  const ws = new WebSocket(request.url) as CustomWebSocket;

  ws.on('message', async (rawData: RawData) => {
    try {
      // Convert RawData to Buffer
      let audioBuffer: Buffer;
      if (rawData instanceof Buffer) {
        audioBuffer = rawData;
      } else if (rawData instanceof ArrayBuffer) {
        audioBuffer = Buffer.from(rawData);
      } else if (Array.isArray(rawData)) {
        audioBuffer = Buffer.concat(rawData.map(chunk => Buffer.from(chunk)));
      } else {
        throw new Error('Unsupported data format');
      }

      // Create a temporary file for the audio data
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });

      // Convert speech to text
      const transcript = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1"
      });

      // Add user message to thread
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: transcript.text
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId
      });

      // Wait for the response
      let response = await openai.beta.threads.runs.retrieve(threadId, run.id);
      while (response.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      // Get latest message
      const messages = await openai.beta.threads.messages.list(threadId);
      const latestMessage = messages.data[0].content[0];
      
      // Check if the content is text
      if ('text' in latestMessage && latestMessage.type === 'text') {
        ws.send(Buffer.from(JSON.stringify({ 
          response: latestMessage.text.value,
          type: 'text'
        })));
      } else {
        ws.send(Buffer.from(JSON.stringify({ 
          error: 'Received non-text response',
          type: 'error'
        })));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(Buffer.from(JSON.stringify({ 
        error: 'Failed to process audio',
        type: 'error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })));
    }
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    try {
      ws.send(Buffer.from(JSON.stringify({ 
        error: 'WebSocket error occurred',
        type: 'error',
        details: error.message
      })));
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
  });

  // Handle WebSocket closure
  ws.on('close', () => {
    console.log('WebSocket closed');
  });

  return new Response(null, {
    status: 101, // Switching Protocols
  });
}