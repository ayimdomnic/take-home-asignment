import { z } from "zod"
import { CreateUserSchema, UserSchema } from "../schemas"

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>