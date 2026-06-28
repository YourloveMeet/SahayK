'use client'

import { logoutAction } from '@/services/auth.service'
import { Button } from './ui/button'

import { useQueryClient } from '@tanstack/react-query'

export function LogoutButton() {
  const queryClient = useQueryClient()
  return (
    <Button variant="outline" onClick={() => {
      queryClient.clear()
      logoutAction()
    }}>
      Sign Out
    </Button>
  )
}
