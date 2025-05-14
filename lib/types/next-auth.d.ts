import { User } from '@prisma/client'

declare module "next-auth" {
    interface Session {
        user: Omit<User, 'passwordHash'>
    }
}


declare module "next-auth/jwt" {
    interface JWT {
        user: Omit<User, 'passwordHash'>
    }
}