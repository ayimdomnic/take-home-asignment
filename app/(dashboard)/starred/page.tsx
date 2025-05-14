import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import StarredFilesView from "@/components/starred-files-view"

export default async function StarredPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return <StarredFilesView />
}
