// app/page.tsx
'use client';
import { useState } from 'react';
import HotelSearch from './components/HotelSearch';
import LandingPage from './components/Landing';

export default function Home() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <div className={`transition-all duration-500 ${showSearch ? 'opacity-0 hidden' : 'opacity-100'}`}>
        <LandingPage onStartSearch={() => setShowSearch(true)} />
      </div>
      
      <div className={`transition-all duration-500 ${showSearch ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <HotelSearch />
      </div>
    </main>
  );
}