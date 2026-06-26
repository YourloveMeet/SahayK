'use client'

import React, { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
  { code: 'gu', label: 'ગુજરાતી', short: 'GU' },
]

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('en')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check cookie for googtrans
    // Pattern could be: googtrans=/en/hi
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/)
    if (match && match[1]) {
      setCurrentLang(match[1])
    }
  }, [])

  const switchLanguage = (langCode: string) => {
    if (langCode === 'en') {
      // Clear cookie to revert to default
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
    }
    window.location.reload();
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 hover:bg-gray-200/80 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/50 rounded-full border border-gray-200 dark:border-zinc-700 transition-all shadow-sm"
      >
        <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        <span className="text-sm font-bold text-gray-800 dark:text-white uppercase">
          {LANGUAGES.find(l => l.code === currentLang)?.short || 'EN'}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setIsOpen(false);
                  switchLanguage(lang.code);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between ${currentLang === lang.code ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {lang.label}
                {currentLang === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
