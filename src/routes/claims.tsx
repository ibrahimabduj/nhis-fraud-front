import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClaimsPage } from '@/pages/ClaimsPage'
import { isAuthenticated } from '@/lib/auth'

export const Route = createFileRoute('/claims')({
  beforeLoad: ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      } as any)
    }
  },
  component: ClaimsPage,
})

