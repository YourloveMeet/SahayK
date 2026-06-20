'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

export default function CatalogViewer({ categories }: { categories: any[] }) {
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedService])

  // Render the categories

  return (
    <>
      <div className="space-y-12">
        {categories?.map((category, categoryIndex) => {
          
          // Use the unified monochrome glass theme for all cards
          const theme = {
            bg: "bg-white/60 dark:bg-black/60 backdrop-blur-xl",
            border: "border-gray-200 dark:border-zinc-800",
            hoverBorder: "hover:border-gray-300 dark:hover:border-zinc-600",
            textHover: "group-hover:text-gray-900 dark:group-hover:text-white",
            iconGradient: "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
          };

          // Sort services by sort_order
          let sortedServices = [...(category.services || [])].sort((a, b) => a.sort_order - b.sort_order);

          if (sortedServices.length === 0) {
            sortedServices = [{
              id: `general-${category.id}`,
              category_id: category.id,
              title: `General ${category.title} Request`,
              estimated_time: 'Varies',
              steps: ['Describe what you need', 'A volunteer will be matched', 'Get help quickly'],
              documents_needed: []
            }];
          }

          return (
            <div key={category.id} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-2 border-l-4 border-gray-900 dark:border-white pl-4 flex items-center gap-3">
                {category.title}
              </h2>
              
              <div className="flex overflow-x-auto pb-8 pt-2 px-2 -mx-2 snap-x snap-mandatory hide-scrollbar gap-5 after:content-[''] after:shrink-0 after:w-4">
                {sortedServices.map((service) => (
                  <div 
                    key={service.id} 
                    onClick={() => setSelectedService(service)}
                    className="snap-start shrink-0 w-[260px] h-[140px] relative group cursor-pointer"
                  >
                    <div className={`absolute -inset-1 bg-gray-200/50 dark:bg-zinc-800/50 rounded-[1rem] transition-all duration-300 opacity-0 group-hover:opacity-100 blur-md`}></div>
                    
                    <div className={`h-full flex flex-col justify-between p-6 ${theme.bg} border ${theme.border} rounded-[1rem] shadow-sm hover:shadow-md ${theme.hoverBorder} transition-all duration-300 hover:-translate-y-1 relative z-10 overflow-hidden`}>
                      <h3 className={`text-base font-bold text-gray-800 dark:text-gray-200 leading-snug transition-colors line-clamp-3 ${theme.textHover}`}>
                        {service.title}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className={`h-8 w-8 rounded-full ${theme.iconGradient} shadow-sm border border-gray-200 dark:border-zinc-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                          <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Overlay */}
      {mounted && selectedService && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedService(null)}>
          
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{selectedService.title}</h2>
              <button 
                onClick={() => setSelectedService(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors text-gray-600 dark:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 pb-4">
                
                {/* Left Column: Try It Yourself */}
                <div className="space-y-8">
                  <div>
                    <div className="inline-block px-4 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 font-bold rounded-full text-sm uppercase tracking-wider mb-4 border border-gray-200 dark:border-zinc-700">
                      Option 1: Try It Yourself
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                      You can complete this service online directly through the official portal. Follow these steps:
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedService.steps?.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700">
                          {idx + 1}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed pt-1 font-medium">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documents You'll Need to Upload
                    </h4>
                    <ul className="space-y-2">
                      {selectedService.documents_needed?.map((doc: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-400 font-medium">
                          <svg className="w-5 h-5 text-gray-900 dark:text-white shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedService.official_url && (
                    <div className="pt-2">
                      <a 
                        href={selectedService.official_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-bold rounded-xl transition-all shadow-md hover:shadow-lg w-full justify-center md:w-auto"
                      >
                        Open Official Website
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Column: Request Volunteer */}
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <div className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold rounded-full text-sm uppercase tracking-wider">
                      Option 2: Need Help?
                    </div>
                  </div>

                  <div className="flex-1 p-6 md:p-8 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-3xl shadow-inner relative overflow-hidden flex flex-col">
                    
                    {/* Decorative blur */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

                    <p className="text-blue-900 dark:text-blue-200 font-medium text-lg leading-relaxed relative z-10 mb-8">
                      If you cannot complete this yourself, a SahayaK volunteer can assist you in person.
                    </p>

                    <div className="space-y-6 relative z-10 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 dark:border-blue-800">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Estimated Time</div>
                          <div className="text-gray-600 dark:text-gray-400 mt-1">{selectedService.estimated_time || 'Varies'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 dark:border-blue-800">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Documents You'll Need</div>
                          <div className="text-gray-600 dark:text-gray-400 mt-1">Please have these ready when the volunteer arrives.</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 dark:border-blue-800">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Location Sharing</div>
                          <div className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">You will pin your exact location so the volunteer knows where to meet you.</div>
                        </div>
                      </div>
                    </div>

                    {/* Button pushed to bottom using mt-auto */}
                    <div className="mt-auto relative z-10 pt-2">
                      <Link 
                        href={`/seeker/task/new?service=${selectedService.id}&category=${selectedService.category_id}`}
                        className="flex items-center justify-center gap-2 w-full px-6 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1"
                      >
                        Request a Volunteer
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
