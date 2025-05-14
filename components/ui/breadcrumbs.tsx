"use client"

import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile as useMobile } from "@/hooks/use-mobile"

interface BreadcrumbItem {
  name: string
  id: string | null
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  onNavigate: (id: string | null) => void
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  const isMobile = useMobile()

  // On mobile, only show the current folder and its parent
  const displayItems =
    isMobile && items.length > 2 ? [items[0], { name: "...", id: null }, items[items.length - 1]] : items

  return (
    <nav className="flex items-center space-x-1 text-sm overflow-x-auto pb-1 max-w-full">
      {displayItems.map((item, index) => (
        <div key={index} className="flex items-center flex-shrink-0">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto px-2 py-1 text-sm font-medium rounded-full",
              index === displayItems.length - 1 && "bg-accent text-accent-foreground",
            )}
            onClick={() => onNavigate(item.id)}
          >
            {index === 0 ? <Home className="mr-1 h-4 w-4" /> : null}
            <span className="truncate max-w-[150px]">{item.name}</span>
          </Button>
        </div>
      ))}
    </nav>
  )
}
