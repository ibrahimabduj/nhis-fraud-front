import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useNavigate } from "@tanstack/react-router"
import { clearAuth, getAuth } from "@/lib/auth"
import { IconLogout } from "@tabler/icons-react"

export function SiteHeader() {
  const navigate = useNavigate()
  const auth = getAuth()

  function handleLogout() {
    clearAuth()
    navigate({ to: '/login' })
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {/* Page title is rendered by each page's content area */}
        <div className="ml-auto flex items-center gap-2">
          {auth.email && (
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {auth.email}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2"
          >
            <IconLogout className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
