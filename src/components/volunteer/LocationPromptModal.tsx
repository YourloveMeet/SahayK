import React, { useState, useEffect, useRef } from 'react';

interface LocationPromptModalProps {
  isOpen: boolean;
  onSelectLiveLocation: () => void;
  onSelectManualLocation: (lat: number, lng: number, addressText: string) => void;
}

export function LocationPromptModal({ isOpen, onSelectLiveLocation, onSelectManualLocation }: LocationPromptModalProps) {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=${encodeURIComponent(query)}&maxSuggestions=5&countryCode=IND`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (e) {
      console.error('Failed to fetch suggestions', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress(val);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500);
  };

  const selectSuggestion = async (suggestion: any) => {
    setAddress(suggestion.text);
    setSuggestions([]);
    setShowSuggestions(false);
    
    try {
      const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&magicKey=${suggestion.magicKey}`);
      const data = await res.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const loc = data.candidates[0].location;
        onSelectManualLocation(loc.y, loc.x, suggestion.text);
      }
    } catch (e) {
      console.error('Failed to fetch exact location coordinates', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm h-screen w-screen overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 overflow-visible animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-black text-center rounded-t-3xl">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Where are you located?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">
            Set your location to see requests near you and start helping!
          </p>
        </div>

        <div className="p-6 space-y-6">
          <button
            onClick={onSelectLiveLocation}
            className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 shadow-xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
          >
            <span className="text-xl">📍</span> Use My Live Location (Recommended)
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200 dark:border-zinc-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 font-bold text-sm uppercase tracking-wider">or search manually</span>
            <div className="flex-grow border-t border-gray-200 dark:border-zinc-700"></div>
          </div>

          <div className="relative z-[9999]">
            <input 
              type="text"
              placeholder="e.g. Bandra Kurla Complex..." 
              className="w-full p-4 text-lg border bg-white/50 dark:bg-black/20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white shadow-inner placeholder:text-gray-400 transition-all border-gray-200 dark:border-zinc-800"
              value={address}
              onChange={handleAddressChange}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              autoComplete="off"
            />
            
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-[100%] mt-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm font-medium text-gray-500">Searching locations...</div>
                ) : suggestions.length > 0 ? (
                  <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {suggestions.map((suggestion, idx) => (
                      <li 
                        key={idx} 
                        onClick={() => selectSuggestion(suggestion)}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer flex items-start gap-3 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-900 dark:text-white shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-tight">
                          {suggestion.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm font-medium text-gray-500">No locations found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
