'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function logUserActivity(action: string, details?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Get IP address from headers
    const headerList = await headers()
    let ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'Unknown'
    
    // Clean IP string (x-forwarded-for can be a comma-separated list)
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim()
    }

    // Try to get location from IP using free ip-api
    let location = 'Unknown Location'
    if (ip !== 'Unknown' && ip !== '::1' && ip !== '127.0.0.1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`)
        const geoData = await geoRes.json()
        if (geoData.status === 'success') {
          location = `${geoData.city}, ${geoData.regionName}, ${geoData.country}`
        }
      } catch (e) {
        console.error('GeoIP lookup failed', e)
      }
    } else if (ip === '::1' || ip === '127.0.0.1') {
      location = 'Localhost'
    }

    // Insert log
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      details,
      ip_address: ip,
      location
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
