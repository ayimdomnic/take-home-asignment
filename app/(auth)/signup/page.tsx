import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import SignUpForm from "@/components/auth/forms/register"
import Image from "next/image"
import Link from "next/link"

export default async function SignUpPage() {
    const session = await getServerSession(authOptions)

    if (session) {
        redirect("/")
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Image
                        src="/placeholder.svg?height=40&width=120"
                        alt="Google Drive"
                        width={120}
                        height={40}
                        className="mx-auto"
                    />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">Create your account</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/signin" className="font-medium text-primary hover:text-primary/90">
                            Sign in
                        </Link>
                    </p>
                </div>
                <div className="mt-8 bg-card py-8 px-4 shadow-sm rounded-lg sm:px-10 slide-in">
                    <SignUpForm />
                </div>
            </div>
        </div>
    )
}
