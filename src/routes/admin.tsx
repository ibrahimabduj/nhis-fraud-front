import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminPage } from '@/pages/AdminPage'
import { isAuthenticated } from '@/lib/auth'

export const Route = createFileRoute('/admin')({
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
  component: AdminPage,
})
