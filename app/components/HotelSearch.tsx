'use client';
import { useState, useEffect } from 'react';

interface City {
  name: string;
  country: string;
  region: string;
  id: string;
}

interface CountryCode {
  [key: string]: string;
}

interface Hotel {
  name: string;
  address: string;
  phone: string;
  website?: string;
  stars?: number;
  id: string;
}

interface CallStatus {
  status: 'idle' | 'initiating' | 'connected' | 'completed' | 'failed';
  message?: string;
}

export default function HotelSearch() {
  const [city, setCity] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [hotel, setHotel] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [hotelSuggestions, setHotelSuggestions] = useState<Hotel[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [isHotelLoading, setIsHotelLoading] = useState(false);
  const [error, setError] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });
  const [callPurpose, setCallPurpose] = useState('');
  // Add this constant for country codes
const COUNTRY_CODES: CountryCode = {
  'India': '91',
  'United Kingdom': '44',
  'United States': '1',
  'China': '86',
  'Japan': '81',
  'Australia': '61',
  'Germany': '49',
  'France': '33',
  'Canada': '1',
  // Add more as needed
};

// Replace your existing formatPhoneDisplay function with this:
const formatPhoneDisplay = (phone: string, country: string) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Get country code
  const countryCode = COUNTRY_CODES[country] || '1';
  
  // If already has plus sign, return as is
  if (phone.startsWith('+')) {
    return phone;
  }

  // If starts with 00, replace with +
  if (digits.startsWith('00')) {
    return '+' + digits.substring(2);
  }

  // If starts with 0, remove it and add country code
  if (digits.startsWith('0')) {
    return '+' + countryCode + digits.substring(1);
  }

  // If no leading 0, just add country code
  return '+' + countryCode + digits;
};

// Add this where you define other state variables
const [showTestCall, setShowTestCall] = useState(true); // Set to false in production


  useEffect(() => {
    const searchCities = async () => {
      if (city.length < 2) {
        setCitySuggestions([]);
        return;
      }

      setIsCityLoading(true);
      try {
        const response = await fetch(`/api/cities?query=${encodeURIComponent(city)}`);
        const data = await response.json();
        setCitySuggestions(data.cities);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        setError('Failed to load cities');
      }
      setIsCityLoading(false);
    };

    const timeoutId = setTimeout(searchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [city]);

  useEffect(() => {
    const searchHotels = async () => {
      if (hotel.length < 2 || !selectedCity) {
        setHotelSuggestions([]);
        return;
      }

      setIsHotelLoading(true);
      try {
        const response = await fetch(
          `/api/hotels?city=${encodeURIComponent(selectedCity.name)}&query=${encodeURIComponent(hotel)}`
        );
        const data = await response.json();
        setHotelSuggestions(data.hotels);
      } catch (error) {
        console.error('Failed to fetch hotels:', error);
        setError('Failed to load hotels');
      }
      setIsHotelLoading(false);
    };

    const timeoutId = setTimeout(searchHotels, 300);
    return () => clearTimeout(timeoutId);
  }, [hotel, selectedCity]);

 
  const handleHotelSelect = (hotel: Hotel) => {
    console.log('Selected city country:', selectedCity?.country); // Debug log
    console.log('Original phone:', hotel.phone); // Debug log
    
    setSelectedHotel(hotel);
    setHotel(hotel.name);
  
    if (hotel.phone) {
      try {
        const formattedPhone = formatPhoneDisplay(
          hotel.phone,
          selectedCity?.country || 'United Kingdom'
        );
        console.log('Formatted phone:', formattedPhone); // Debug log
        setPhone(formattedPhone);
      } catch (error) {
        console.error('Phone formatting error:', error);
        setPhone(hotel.phone); // Fallback to original phone number
      }
    }
  
    setShowHotelSuggestions(false);
    if (hotel.phone) {
      setStep(2);
    } else {
      scrapePhoneNumber(hotel.name, selectedCity?.name || '');
    }
  };

  const scrapePhoneNumber = async (hotelName: string, cityName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scrape-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel: hotelName,
          city: cityName,
        }),
      });
      const data = await response.json();
      if (data.phoneNumber) {
        try {
          const formattedPhone = formatPhoneDisplay(
            data.phoneNumber,
            selectedCity?.country || 'United Kingdom'
          );
          setPhone(formattedPhone);
          setStep(2);
        } catch (error) {
          console.error('Phone formatting error:', error);
          setPhone(data.phoneNumber); // Fallback to unformatted number
          setStep(2);
        }
      } else {
        setError('Could not find phone number');
      }
    } catch (error) {
      console.error('Failed to scrape phone number:', error);
      setError('Failed to get phone number');
    }
    setIsLoading(false);
  };

const handleCall = async () => {
  if (!selectedHotel || !phone || !selectedCity) {
    setError('Missing required information');
    return;
  }

  setCallStatus({ status: 'initiating', message: 'Initiating call...' });
  try {
    const response = await fetch('/api/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hotelName: selectedHotel.name,
        phoneNumber: phone,
        city: selectedCity.name,
        country: selectedCity.country,
        purpose: callPurpose || 'inquire about room availability'
      }),
    });

      const data = await response.json();
      
      if (data.success) {
        setCallStatus({ 
          status: 'connected', 
          message: `Call connected! Call ID: ${data.callSid}` 
        });
        pollCallStatus(data.callSid);
      } else {
        setCallStatus({ 
          status: 'failed', 
          message: data.error || 'Failed to initiate call' 
        });
      }
    } catch (error) {
      console.error('Call failed:', error);
      setCallStatus({ 
        status: 'failed', 
        message: 'Failed to connect call' 
      });
    }
  };

  const pollCallStatus = (callSid: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/call-status?callSid=${callSid}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          setCallStatus({ 
            status: 'completed', 
            message: 'Call completed successfully' 
          });
          return;
        }
        
        if (data.status === 'failed') {
          setCallStatus({ 
            status: 'failed', 
            message: 'Call ended unexpectedly' 
          });
          return;
        }
        
        setTimeout(checkStatus, 5000);
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    checkStatus();
  };

  // Keep all your imports and interface definitions the same
// Only updating the return JSX part:

return (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto relative">
      <div className="bg-white rounded-2xl shadow-2xl">
        

        <div className="p-8 relative">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              {/* City Search */}
              <div className="relative mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Select City
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setSelectedCity(null);
                      setShowCitySuggestions(true);
                    }}
                    placeholder="Enter city name..."
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                             transition-all duration-200 bg-gray-50 hover:bg-white
                             text-gray-900 placeholder-gray-400"
                  />
                  {isCityLoading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    </div>
                  )}
                </div>
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <div className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100">
                    {citySuggestions.map((city) => (
                      <div
                        key={city.id}
                        className="cursor-pointer transition-colors duration-200"
                        onClick={() => {
                          setSelectedCity(city);
                          setCity(city.name);
                          setShowCitySuggestions(false);
                        }}
                      >
                        <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                          <div className="font-semibold text-gray-900">{city.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{city.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hotel Search */}
              <div className="relative" style={{ minHeight: '200px' }}>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Select Hotel
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={hotel}
                    onChange={(e) => {
                      setHotel(e.target.value);
                      setShowHotelSuggestions(true);
                    }}
                    placeholder={selectedCity ? "Enter hotel name..." : "Select a city first"}
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                             transition-all duration-200 bg-gray-50 hover:bg-white
                             text-gray-900 placeholder-gray-400
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!selectedCity}
                  />
                  {isHotelLoading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    </div>
                  )}
                </div>
                {showHotelSuggestions && hotelSuggestions.length > 0 && (
                  <div className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[300px] overflow-y-auto">
                    {hotelSuggestions.map((hotel) => (
                      <div
                        key={hotel.id}
                        className="cursor-pointer transition-colors duration-200"
                        onClick={() => handleHotelSelect(hotel)}
                      >
                        <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                          <div className="font-semibold text-gray-900">{hotel.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{hotel.address}</div>
                          {hotel.phone && (
                            <div className="text-sm text-gray-400 mt-1">{hotel.phone}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Helper Text */}
              {!selectedCity && (
                <div className="text-center text-gray-500 bg-gray-50 rounded-xl p-4">
                  Start by selecting a city to find hotels
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedHotel && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify Hotel Details</h2>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Hotel Name</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedHotel.name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Address</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedHotel.address}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">{phone}</p>
                  </div>
                </div>
                
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-black text-white px-6 py-4 rounded-xl font-medium
                             hover:bg-gray-800 transition-colors duration-200
                             transform hover:scale-[0.99] active:scale-[0.97]"
                  >
                    Confirm Details
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-gray-300 px-6 py-4 rounded-xl font-medium
                             hover:bg-gray-50 transition-colors duration-200
                             transform hover:scale-[0.99] active:scale-[0.97]"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && selectedHotel && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to Call</h2>
                
                <div className="bg-white rounded-lg p-6 mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What would you like to discuss? (Optional)
                  </label>
                  <textarea
                    value={callPurpose}
                    onChange={(e) => setCallPurpose(e.target.value)}
                    placeholder="E.g., Check room availability, Ask about facilities..."
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-gray-500
                             focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                             transition-all duration-200"
                    rows={3}
                  />
                </div>

                <div className="bg-white rounded-lg p-6 mb-6">
                  <p className="text-gray-600">
                    You will be connected to:
                  </p>
                  <p className="text-xl font-semibold text-gray-900 mt-2">{selectedHotel.name}</p>
                  <p className="text-lg text-gray-600 mt-1">{phone}</p>
                </div>

                {callStatus.status !== 'idle' && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    callStatus.status === 'failed' ? 'bg-red-50 text-red-700 border-2 border-red-100' : 
                    callStatus.status === 'completed' ? 'bg-green-50 text-green-700 border-2 border-green-100' : 
                    'bg-blue-50 text-blue-700 border-2 border-blue-100'
                  }`}>
                    <p className="font-medium">{callStatus.message}</p>
                  </div>
                )}

                <button
                  onClick={handleCall}
                  disabled={callStatus.status === 'initiating' || callStatus.status === 'connected'}
                  className="w-full bg-black text-white px-6 py-4 rounded-xl font-medium 
                           hover:bg-gray-800 transition-colors duration-200
                           disabled:bg-gray-400 disabled:cursor-not-allowed
                           transform hover:scale-[0.99] active:scale-[0.97]"
                >
                  {callStatus.status === 'initiating' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Initiating Call...
                    </span>
                  ) : 'Start Call'}
                </button>

                {callStatus.status === 'connected' && (
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    Call is active. Please wait while we connect you...
                  </p>
                )}

                <button
                  onClick={() => setStep(2)}
                  className="mt-4 w-full border-2 border-gray-300 px-6 py-4 rounded-xl font-medium 
                           hover:bg-gray-50 transition-colors duration-200
                           transform hover:scale-[0.99] active:scale-[0.97]"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}