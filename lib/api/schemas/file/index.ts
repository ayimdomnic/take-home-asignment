import { z } from "zod";
import { cuidSchema, positiveIntSchema, datetimeSchema } from "../general";

export const fileSchema = z.object({
    id: cuidSchema.optional(),
    name: z.string().min(1, "Filename is required").max(255),
    type: z.string().min(1, "File type is required"),
    size: positiveIntSchema,
    url: z.string().url(),
    storagePath: z.string().min(1),
    blobId: z.string().min(1),
    createdAt: datetimeSchema.optional(),
    updatedAt: datetimeSchema.optional(),
    userId: cuidSchema,
    folderId: cuidSchema.nullable().optional(),
});

export const createFileSchema = fileSchema.pick({
    name: true,
    type: true,
    size: true,
    url: true,
    storagePath: true,
    blobId: true,
    folderId: true,
}).extend({
    userId: z.string().optional(),
});

export const updateFileSchema = fileSchema.partial().pick({
    name: true,
    folderId: true,
}).extend({
    id: cuidSchema,
});


export const fileUploadSchema = z.object({
    file: z.instanceof(File, { message: "File is required" }),
    metadata: z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        size: positiveIntSchema,
        folderId: cuidSchema.nullable().optional(),
    }),
});