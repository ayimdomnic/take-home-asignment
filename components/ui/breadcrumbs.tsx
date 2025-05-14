"use client"

import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BreadcrumbItem {
  name: string
  id: string | null
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  onNavigate: (id: string | null) => void
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-sm font-medium"
            onClick={() => onNavigate(item.id)}
          >
            {index === 0 ? <Home className="mr-1 h-4 w-4" /> : null}
            {item.name}
          </Button>
        </div>
      ))}
    </nav>
  )
}
