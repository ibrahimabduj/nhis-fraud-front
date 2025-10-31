import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/DashboardPage'
import { isAuthenticated } from '@/lib/auth'

export const Route = createFileRoute('/dashboard')({
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
  component: DashboardPage,
})


