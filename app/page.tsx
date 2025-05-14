import { authOptions } from "@/lib";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Dashboard from "@/components/dashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/signin')
  }
  return <Dashboard />
}
