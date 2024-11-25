// components/Landing.tsx

interface LandingProps {
    onStartSearch: () => void;
  }
  
  export default function LandingPage({ onStartSearch }: LandingProps) {
    return (
      <main className="bg-white">
        <nav className="bg-black text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Hotel Booking GPT</h1>
          </div>
        </nav>
  
        <section className="container mx-auto py-20 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-400">Connect with Hotels Instantly</h2>
          <p className="text-xl text-gray-700 mb-12">
            Direct hotel communication powered by AI assistance for seamless booking experiences
          </p>
  
          {/* Search Button Section */}
          <div className="mb-20">
            <div 
              onClick={onStartSearch}
              className="group relative inline-flex items-center justify-center cursor-pointer"
            >
              <div className="absolute -inset-0.5 bg-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
              <button className="relative bg-white text-black px-12 py-6 rounded-lg border-2 border-black text-2xl font-bold
                hover:bg-black hover:text-white transition-all duration-200 transform hover:scale-105
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                flex items-center gap-3"
              >
                Find and Call Hotels
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 transform group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
  
          
        </section>
  
        {/* Features Section */}
        <section id="features" className="bg-white pb-20">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-500">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              <div className="p-8 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-black transition-all duration-200">
            
                <h3 className="text-xl font-bold mb-4 text-gray-800">Smart Search</h3>
                <p className="text-gray-700">Instantly find hotels with real-time suggestions and automatic phone number formatting.</p>
              </div>
              <div className="p-8 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-black transition-all duration-200">
            
                <h3 className="text-xl font-bold mb-4 text-gray-800">AI Assistant</h3>
                <p className="text-gray-700">Get assistance during calls with our AI that helps with translations and inquiries.</p>
              </div>
              <div className="p-8 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-black transition-all duration-200">
                
                <h3 className="text-xl font-bold mb-4 text-gray-800">Direct Calling</h3>
                <p className="text-gray-700">Connect directly with hotels through our integrated calling system.</p>
              </div>
            </div>
          </div>
        </section>
  
        {/* How It Works Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-bold mb-2 text-gray-700">Search Location</h3>
                <p className="text-gray-600">Enter your desired city or location</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-bold mb-2 text-gray-700">Select Hotel</h3>
                <p className="text-gray-600">Choose from available hotels</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-bold mb-2 text-gray-700">Verify Details</h3>
                <p className="text-gray-600">Confirm hotel information</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
                <h3 className="font-bold mb-2 text-gray-700">Connect</h3>
                <p className="text-gray-600">Start your AI-assisted call</p>
              </div>
            </div>
          </div>
        </section>
  
        
      </main>
    );
  }