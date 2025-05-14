import { z } from "zod";

export const credentialsSchema = z.object({
    email: z.string().email("Invalid Email format").transform(val => val.toLocaleLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters")
});

