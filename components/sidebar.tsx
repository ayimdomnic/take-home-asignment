"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { HardDrive, Clock, Star, Users, Trash2, LogOut, Settings, User, X, Plus } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface SidebarProps {
  currentFolderId: string | null
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ currentFolderId, isOpen, onToggle }: SidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageTotal, setStorageTotal] = useState(15)
  const [storagePercent, setStoragePercent] = useState(0)

  useEffect(() => {
    // Simulate fetching storage info
    const fetchStorageInfo = async () => {
      // In a real app, you would fetch this from your API
      const usedGB = Math.random() * 10
      setStorageUsed(usedGB)
      setStoragePercent((usedGB / storageTotal) * 100)
    }

    fetchStorageInfo()
  }, [storageTotal])

  const navItems = [
    {
      name: "My Drive",
      icon: HardDrive,
      href: "/",
      active: !currentFolderId,
    },
    {
      name: "Shared with me",
      icon: Users,
      href: "/shared",
      active: false,
    },
    {
      name: "Recent",
      icon: Clock,
      href: "/recent",
      active: false,
    },
    {
      name: "Starred",
      icon: Star,
      href: "/starred",
      active: false,
    },
    {
      name: "Trash",
      icon: Trash2,
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

  // If sidebar is closed on mobile, render a minimal version
  if (isMobile && !isOpen) {
    return null
  }

  // If sidebar is open on mobile, render a modal-like sidebar
  if (isMobile && isOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onToggle}>
        <div
          className="absolute top-0 left-0 h-full w-64 bg-card shadow-lg slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center">
              <svg viewBox="0 0 87 24" className="h-6 w-auto">
                <path
                  d="M17.64 9.2c-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04 0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36zm14.4 2.4c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04zm-14.4 7.2c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04zm14.4-7.2c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04z"
                  fill="var(--google-blue)"
                />
                <path
                  d="M42.48 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                  fill="var(--google-red)"
                />
                <path
                  d="M56.4 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                  fill="var(--google-yellow)"
                />
                <path
                  d="M70.32 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                  fill="var(--google-green)"
                />
              </svg>
              <span className="ml-2 text-lg font-medium">Drive</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4">
            <Button className="w-full justify-center mb-6 bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    item.active
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => isMobile && onToggle()}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Storage</span>
                <span className="text-muted-foreground">
                  {storageUsed.toFixed(1)} GB of {storageTotal} GB used
                </span>
              </div>
              <Progress value={storagePercent} className="h-1" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback>{session?.user?.name ? getInitials(session.user.name) : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2 text-left">
                      <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {session?.user?.email || ""}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    )
  }

  // Desktop sidebar using shadcn sidebar component
  return (
    <SidebarProvider defaultOpen={isOpen} onOpenChange={onToggle}>
      <ShadcnSidebar>
        <SidebarHeader>
          <div className="flex items-center p-2">
            <svg viewBox="0 0 87 24" className="h-6 w-auto">
              <path
                d="M17.64 9.2c-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04 0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36zm14.4 2.4c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04zm-14.4 7.2c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04zm14.4-7.2c0 .72-.12 1.44-.36 2.04-.24.6-.72 1.08-1.32 1.32-.6.24-1.32.36-2.04.36-.72 0-1.44-.12-2.04-.36-.6-.24-1.08-.72-1.32-1.32-.24-.6-.36-1.32-.36-2.04 0-.72.12-1.44.36-2.04.24-.6.72-1.08 1.32-1.32.6-.24 1.32-.36 2.04-.36.72 0 1.44.12 2.04.36.6.24 1.08.72 1.32 1.32.24.6.36 1.32.36 2.04z"
                fill="var(--google-blue)"
              />
              <path
                d="M42.48 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                fill="var(--google-red)"
              />
              <path
                d="M56.4 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                fill="var(--google-yellow)"
              />
              <path
                d="M70.32 24h3.84v-7.68h7.68v-3.84h-7.68v-7.68h-3.84v7.68h-7.68v3.84h7.68v7.68z"
                fill="var(--google-green)"
              />
            </svg>
            <span className="ml-2 text-lg font-medium">Drive</span>
          </div>
          <div className="px-2 pt-2">
            <Button className="w-full justify-center bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={item.active}>
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Storage</span>
                <span className="text-muted-foreground">
                  {storageUsed.toFixed(1)} GB of {storageTotal} GB used
                </span>
              </div>
              <Progress value={storagePercent} className="h-1" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback>{session?.user?.name ? getInitials(session.user.name) : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2 text-left">
                      <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {session?.user?.email || ""}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
        <SidebarTrigger />
      </ShadcnSidebar>
    </SidebarProvider>
  )
}
