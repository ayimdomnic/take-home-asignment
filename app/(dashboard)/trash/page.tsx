import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import TrashView from "@/components/trash-view"

export default async function TrashPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return <TrashView />
}
