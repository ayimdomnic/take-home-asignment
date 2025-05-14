import { del, put } from "@vercel/blob";
import { UploadOptions } from "./types";
import { API_ERRORS, ApiError } from "../api";

export async function upload(options: UploadOptions) {
    try {
        const { file, userId, folderId } = options;

        const pathPrefix = folderId ? `${userId}/${folderId}/` : `${userId}`;

        const fileName = `${Date.now()}-${process.env.NODE_ENV}-${file.name}`;
        const path = `${pathPrefix}${fileName}`;

        const blob = await put(path, file, {
            access: 'public',
            contentType: file.type
        })

        return {
            url: blob.url,
            path: blob.pathname,
            blobId: blob.url.split('/').pop() || " ",
        }
    } catch (error) {
        console.error('Blob Upload Error:', error);
        throw new ApiError(
            API_ERRORS.STORAGE_ERROR.message,
            API_ERRORS.STORAGE_ERROR.statusCode,
            API_ERRORS.STORAGE_ERROR.code
        )
    }
}