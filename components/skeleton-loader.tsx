import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonLoaderProps {
  viewMode: "grid" | "list"
}

export function SkeletonLoader({ viewMode }: SkeletonLoaderProps) {
  return (
    <div>
      {viewMode === "grid" ? (
        <div className="space-y-8">
          {/* Folders section */}
          <div className="mb-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="file-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center p-4 rounded-lg border bg-card">
                  <Skeleton className="h-16 w-16 rounded-md mb-2" />
                  <Skeleton className="h-4 w-24 rounded mb-1" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Files section */}
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="file-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center p-4 rounded-lg border bg-card">
                  <Skeleton className="h-16 w-16 rounded-md mb-2" />
                  <Skeleton className="h-4 w-24 rounded mb-1" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Folders section */}
          <div className="mb-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left text-sm font-medium">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium hidden sm:table-cell">Items</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Modified</th>
                    <th className="py-3 px-4 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded mr-2" />
                          <Skeleton className="h-4 w-40 rounded" />
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <Skeleton className="h-4 w-16 rounded" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-24 rounded" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Files section */}
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="overflow-hidden rounded-lg border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left text-sm font-medium">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium hidden md:table-cell">Type</th>
                    <th className="py-3 px-4 text-left text-sm font-medium hidden sm:table-cell">Size</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Modified</th>
                    <th className="py-3 px-4 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded mr-2" />
                          <Skeleton className="h-4 w-40 rounded" />
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <Skeleton className="h-4 w-16 rounded" />
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <Skeleton className="h-4 w-12 rounded" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-24 rounded" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
