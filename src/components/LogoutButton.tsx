'use client'

import { logoutAction } from '@/services/auth.service'
import { Button } from './ui/button'

export function LogoutButton() {
  return (
    <Button variant="outline" onClick={() => logoutAction()}>
      Sign Out
    </Button>
  )
}
