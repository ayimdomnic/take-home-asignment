import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { credentialsSchema } from "./schemas";
import { fromZodError } from "zod-validation-error";
import { AuthError, AuthErrors } from "./errors";


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const validatedCredentials = credentialsSchema.safeParse(credentials);

                    if (!validatedCredentials.success) {
                        const validationError = fromZodError(validatedCredentials.error);
                        throw new AuthError(
                            AuthErrors.MISSING_CREDENTIALS.code,
                            validationError.message
                        )
                    }

                    const { email, password } = validatedCredentials.data;

                    const user = await prisma.user.findUnique({
                        where: { email }
                    });

                    if (!user) {
                        throw new AuthError(
                            AuthErrors.USER_NOT_FOUND.code,
                            AuthErrors.USER_NOT_FOUND.message
                        )
                    }

                    if (!user.passwordHash) {
                        throw new AuthError(
                            AuthErrors.OAUTH_ACCOUNT_NOT_LINKED.code,
                            AuthErrors.OAUTH_ACCOUNT_NOT_LINKED.message
                        );
                    }

                    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

                    if (!isValidPassword) {
                        throw new AuthError(
                            AuthErrors.INVALID_CREDENTIALS.code,
                            AuthErrors.INVALID_CREDENTIALS.message
                        );
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    }
                } catch (error) {
                    if (error instanceof AuthError) {
                        throw error
                    }

                    // log the error message for debugging
                    console.error("Authentication error:", error);
                    throw new AuthError(
                        AuthErrors.UNKNOWN_ERROR.code,
                        AuthErrors.UNKNOWN_ERROR.message
                    )
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET!
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore
                session.user.id = token.id as string;
                // @ts-ignore
                // session.user.role = token.role; // Example
            }
            return session;
        },
    },
    pages: {
        signIn: "/signin",
        signOut: "/signout"
    },
    debug: process.env.NODE_ENV === 'development',
};