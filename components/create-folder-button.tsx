"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FolderPlus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useIsMobile as useMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FolderFormValues, folderSchema as FolderSchema } from "@/lib"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"

interface CreateFolderButtonProps {
  parentId: string | null
  onSuccess: () => void
}

export function CreateFolderButton({ parentId, onSuccess }: CreateFolderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const isMobile = useMobile()

  const form = useForm<FolderFormValues>({
    resolver: zodResolver(FolderSchema),
    defaultValues: {
      name: "",
      parentId: parentId,
    },
  })

  async function onSubmit(values: FolderFormValues) {
    setIsCreating(true)

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          parentId: parentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create folder")
      }

      toast.success("Folder created successfully")
      form.reset()
      setIsOpen(false)
      onSuccess()
    } catch (error: any) {
      toast.error("Failed to create folder", {
        description: error.message || "Something went wrong",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className={cn(isMobile ? "px-3" : "")}>
        <FolderPlus className={cn("h-4 w-4", !isMobile && "mr-2")} />
        {!isMobile && "New Folder"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md dialog-content">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="name">Folder Name</Label>
                      <FormControl>
                        <Input
                          {...field}
                          id="name"
                          placeholder="Enter folder name"
                          className="h-10"
                          disabled={isCreating}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              form.handleSubmit(onSubmit)()
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
