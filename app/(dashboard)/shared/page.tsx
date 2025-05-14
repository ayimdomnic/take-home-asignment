import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SharedFilesView from "@/components/shared-files-view"

export default async function SharedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return <SharedFilesView />
}
