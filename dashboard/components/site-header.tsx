/**
 * Site Header Component
 *
 * This is the top bar of the dashboard that shows:
 * - App title
 * - Navigation links (Thesis, GitHub, LinkedIn)
 * - User info and logout button
 *
 * Now with Authentication! 🔐
 * We show the logged-in user's name and a logout button.
 */

"use client"

import { IconBrandGithub, IconBrandLinkedin, IconFileText, IconLogout, IconUser } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function SiteHeader() {
  /**
   * Get the current session
   *
   * useSession() is a React hook from NextAuth that gives us:
   * - session.data: The user's session data (if logged in)
   * - session.status: "loading", "authenticated", or "unauthenticated"
   *
   * Think of it like checking your ticket at a concert:
   * - If you have a valid ticket → session.data has your info
   * - If not → session.data is null
   */
  const { data: session, status } = useSession()

  /**
   * Handle logout
   *
   * When user clicks logout:
   * 1. Call NextAuth's signOut() function
   * 2. It clears the session cookie
   * 3. Redirects to login page
   * 4. User is now logged out!
   */
  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login", // Where to go after logout
    })
  }

  /**
   * Get user's initials for avatar
   *
   * If user's name is "John Doe", this returns "JD"
   * If user's name is "Stefan", this returns "S"
   * Used to show a nice circle with initials instead of a photo
   */
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "?"

    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Article Classification Dashboard</h1>

        {/* Right side - Links and User Menu */}
        <div className="ml-auto flex items-center gap-2">
          {/* Thesis Link */}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://drive.google.com/file/d/1VP-katLsR3I07dTy8LLeXDfBUjHFFNgz/view?usp=sharing"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <IconFileText className="size-4 mr-2" />
              Thesis
            </a>
          </Button>

          {/* GitHub Link */}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/Stefan-Groen/thesis"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <IconBrandGithub className="size-4 mr-2 text-gray-800 dark:text-gray-300" />
              GitHub
            </a>
          </Button>

          {/* LinkedIn Link */}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://www.linkedin.com/in/stefan-groen-557223265/"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <IconBrandLinkedin className="size-4 mr-2" style={{ color: '#0077B5' }} />
              LinkedIn
            </a>
          </Button>

          {/* User Menu with Avatar and Logout */}
          {status === "authenticated" && session?.user && (
            <>
              <Separator orientation="vertical" className="h-6 mx-2" />

              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {/* User Info */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || session.user.username}
                      </p>
                      {session.user.email && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                      <p className="text-xs leading-none text-muted-foreground">
                        @{session.user.username}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Logout Button */}
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <IconLogout className="size-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
