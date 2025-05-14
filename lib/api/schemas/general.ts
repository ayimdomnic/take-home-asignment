import { z } from "zod";

export const cuidSchema = z.string().cuid();
export const emailSchema = z.string().email().toLowerCase();
export const datetimeSchema = z.coerce.date();
export const positiveIntSchema = z.number().int().positive();


export const paginationSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
});
