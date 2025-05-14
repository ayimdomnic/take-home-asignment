import { z } from "zod";
import { cuidSchema, datetimeSchema } from "../general";

export const folderSchema = z.object({
    id: cuidSchema.optional(),
    name: z.string().min(1, "Folder name is required").max(255),
    createdAt: datetimeSchema.optional(),
    updatedAt: datetimeSchema.optional(),
    userId: cuidSchema,
    parentId: cuidSchema.nullable().optional(),
});

export const createFolderSchema = folderSchema.pick({
    name: true,
    parentId: true,
}).extend({
    userId: z.string().optional(),
});

export const updateFolderSchema = folderSchema.partial().pick({
    name: true,
    parentId: true,
}).extend({
    id: cuidSchema,
});

export const folderQuerySchema = z.object({
    parentId: cuidSchema.nullable().optional(),
    includeFiles: z.boolean().default(false),
});