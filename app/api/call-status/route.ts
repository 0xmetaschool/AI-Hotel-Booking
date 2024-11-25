import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callStatus = formData.get('CallStatus');
    const callSid = formData.get('CallSid');

    // Log call status for debugging
    console.log(`Call ${callSid} status: ${callStatus}`);

    return NextResponse.json({
      success: true,
      status: callStatus
    });
  } catch (error) {
    console.error('Status webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}