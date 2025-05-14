import { z } from "zod";
import { cuidSchema, datetimeSchema, emailSchema } from "../general";

export const UserSchema = z.object({
    id: cuidSchema.optional(),
    email: emailSchema,
    name: z.string().min(8).optional(),
    passowrdHash: z.string().min(8).optional(),
    createdAt: datetimeSchema.optional(),
    updatedAt: datetimeSchema.optional(),
    emailVerified: datetimeSchema.nullable().optional(),
    image: z.string().url().nullable().optional()
})

export const CreateUserSchema = UserSchema.pick({
    name: true,
    email: true,
    passowrdHash: true
})

export const UpdateUserSchema = UserSchema.partial().omit({ id: true })

export const accountSchema = z.object({
    id: cuidSchema.optional(),
    userId: cuidSchema,
    type: z.string().min(1),
    provider: z.string().min(1),
    providerAccountId: z.string().min(1),
    refresh_token: z.string().optional(),
    access_token: z.string().optional(),
    expires_at: z.number().int().optional(),
    token_type: z.string().optional(),
    scope: z.string().optional(),
    id_token: z.string().optional(),
    session_state: z.string().optional(),
});

export const sessionSchema = z.object({
    id: cuidSchema.optional(),
    sessionToken: z.string().min(1),
    userId: cuidSchema,
    expires: datetimeSchema,
});

// Verification Token Schema
export const verificationTokenSchema = z.object({
    identifier: z.string().min(1),
    token: z.string().min(1),
    expires: datetimeSchema,
});