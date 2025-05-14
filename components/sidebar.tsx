"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { FileIcon, HardDriveIcon, LogOutIcon, MenuIcon, Settings, Trash2Icon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentFolderId: string | null
}

export function Sidebar({ currentFolderId }: SidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      name: "My Drive",
      icon: HardDriveIcon,
      href: "/",
      active: !currentFolderId,
    },
    {
      name: "Recent",
      icon: FileIcon,
      href: "/recent",
      active: false,
    },
    {
      name: "Trash",
      icon: Trash2Icon,
      href: "/trash",
      active: false,
    },
  ]

  function handleSignOut() {
    signOut({ callbackUrl: "/signin" })
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="mr-2">
          <MenuIcon className="h-5 w-5" />
        </Button>
        {!collapsed && (
          <div className="flex items-center">
            <HardDriveIcon className="mr-2 h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">CloudDrive</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>{session?.user?.name ? getInitials(session.user.name) : "U"}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="ml-2 text-left">
                    <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{session?.user?.email || ""}</p>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
