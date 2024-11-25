// app/api/call/route.ts

import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { formatPhoneNumber, validatePhoneNumber } from '../../utils/phoneFormatting';

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    throw new Error('Missing Twilio configuration. Please check your environment variables.');
  }

  return {
    client: twilio(accountSid, authToken),
    phoneNumber
  };
};

export async function POST(request: Request) {
  try {
    const { hotelName, phoneNumber, city, country, purpose } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format the phone number
    const formattedNumber = formatPhoneNumber(phoneNumber, country);
    console.log('Formatted number:', formattedNumber); // Debug log

    if (!validatePhoneNumber(formattedNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Initialize Twilio client
    let twilioClient;
    let twilioNumber;
    try {
      const twilio = getTwilioClient();
      twilioClient = twilio.client;
      twilioNumber = twilio.phoneNumber;
    } catch (error) {
      console.error('Twilio configuration error:', error);
      return NextResponse.json(
        { error: 'Service configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Create the call
    const call = await twilioClient.calls.create({
      to: formattedNumber,
      from: twilioNumber,
      twiml: `
        <Response>
            <Say>Connecting you to ${hotelName}. Please wait.</Say>
            <Dial>${formattedNumber}</Dial>
        </Response>
      `,
      statusCallback: `${process.env.BASE_URL}/api/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    });

    return NextResponse.json({
      success: true,
      callSid: call.sid
    });

  } catch (error: any) {
    console.error('Call initiation error:', error);
    
    // Handle specific Twilio errors
    if (error.code) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Twilio error: ${error.message}`,
          code: error.code
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to initiate call'
      },
      { status: 500 }
    );
  }
}