import { del } from "@vercel/blob";
import { API_ERRORS, ApiError } from "../api";

export async function deleteBlob(blobUrl: string) {
    try {
        await del(blobUrl);
        return true;
    } catch (error) {
        console.error('Blob deletion error:', error);
        throw new ApiError(
            API_ERRORS.STORAGE_ERROR.message,
            API_ERRORS.STORAGE_ERROR.statusCode,
            API_ERRORS.STORAGE_ERROR.code
        );
    }
}