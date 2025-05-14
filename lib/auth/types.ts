import { z } from "zod";
import { credentialsSchema } from "./schemas";

export type CredentialsType = z.infer<typeof credentialsSchema>;