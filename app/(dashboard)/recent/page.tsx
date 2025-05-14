import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import RecentFilesView from "@/components/recent-files-view"

export default async function RecentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return <RecentFilesView />
}
