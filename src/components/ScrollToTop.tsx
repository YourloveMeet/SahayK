'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()
  
  useEffect(() => {
    // 1. Scroll the main window to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    
    // 2. Also scroll any internal scrolling containers to top
    // (We use requestAnimationFrame to ensure the new page DOM has rendered)
    requestAnimationFrame(() => {
      const scrollContainers = document.querySelectorAll('.overflow-y-auto')
      scrollContainers.forEach(container => {
        container.scrollTop = 0
      })
    })
  }, [pathname])
  
  return null
}
