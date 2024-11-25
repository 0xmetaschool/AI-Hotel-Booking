# Hotel Connect

A Next.js application that allows users to search for hotels and make direct calls using Twilio integration with AI assistance.

## Features

- Real-time city and hotel search with auto-suggestions
- Phone number formatting based on country codes
- Direct calling integration with Twilio
- AI-powered call assistance using OpenAI
- Real-time call status monitoring
- Responsive, modern UI with Tailwind CSS

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js (v18.0.0 or higher)
- npm or yarn
- A Twilio account with:
  - Account SID
  - Auth Token
  - A Twilio phone number
- An OpenAI API key
- ngrok (for local development)

## Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd hotel-connect
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create two `.env` files:

For the Next.js app (root directory), create `.env.local`:
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
OPENAI_API_KEY=your_openai_api_key
BASE_URL=http://localhost:3000
WEBSOCKET_SERVER_URL=ws://localhost:5050/media-stream
```

For the Twilio WebSocket server (in twilio-server directory):
```env
OPENAI_API_KEY=your_openai_api_key
PORT=5050
```

## Running the Application

1. Start the Next.js development server:
```bash
npm run dev
# or
yarn dev
```

2. Start ngrok to create a tunnel for Twilio:
```bash
ngrok http 5050
```

3. Update your `.env.local` with the ngrok URL:
```env
WEBSOCKET_SERVER_URL=wss://your-ngrok-url/media-stream
```

4. In a separate terminal, start the Twilio WebSocket server:
```bash
cd twilio-server
npm install
npm run dev
```

The application should now be running at `http://localhost:3000`

## Project Structure

```
hotel-connect/
├── app/
│   ├── components/
│   │   └── HotelSearch.tsx
│   ├── api/
│   │   ├── call/
│   │   │   └── route.ts
│   │   ├── call-status/
│   │   │   └── route.ts
│   │   ├── voice-webhook/
│   │   │   └── route.ts
│   │   ├── cities/
│   │   │   └── route.ts
│   │   ├── hotels/
│   │   │   └── route.ts
│   │   └── scrape-phone/
│   │       └── route.ts
│   ├── utils/
│   │   └── phoneFormatting.ts
│   └── page.tsx
├── twilio-server/
│   ├── index.js
│   ├── package.json
│   └── .env
├── public/
├── package.json
└── .env.local
```

## API Routes

- `/api/cities`: Search for cities
- `/api/hotels`: Search for hotels in a selected city
- `/api/call`: Initiate a Twilio call
- `/api/call-status`: Get call status
- `/api/voice-webhook`: Handle Twilio voice webhooks
- `/api/scrape-phone`: Fallback phone number scraping

## Environment Setup

### Twilio Configuration
1. Sign up for a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase or use a test Twilio phone number
4. Add the ngrok URL to your Twilio phone number's webhook configuration

### OpenAI Configuration
1. Sign up for an OpenAI account at https://openai.com
2. Generate an API key
3. Add the key to both `.env` files

### Development with ngrok
1. Install ngrok globally:
```bash
npm install -g ngrok
```

2. Start ngrok:
```bash
ngrok http 5050
```

3. Update your environment variables with the ngrok URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Twilio](https://www.twilio.com/)
- [OpenAI](https://openai.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [Fastify](https://www.fastify.io/)

## Acknowledgments

- Twilio for their excellent voice API
- OpenAI for their AI capabilities
- OpenStreetMap for location data

## Support

For support, email [your-email] or open an issue in the repository.