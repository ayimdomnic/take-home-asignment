export class ApiError extends Error {
    constructor(public message: string, public statusCode: number = 400, public code?: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export const API_ERRORS = {
    UNAUTHORIZED: {
        code: 'AUTH_001',
        message: 'Unauthorized access',
        statusCode: 401,
    },
    FORBIDDEN: {
        code: 'AUTH_002',
        message: 'Forbidden access',
        statusCode: 403,
    },
    NOT_FOUND: {
        code: 'RESOURCE_001',
        message: 'Resource not found',
        statusCode: 404,
    },
    VALIDATION_ERROR: {
        code: 'VALIDATION_001',
        message: 'Validation error',
        statusCode: 400,
    },
    STORAGE_ERROR: {
        code: 'STORAGE_001',
        message: 'Storage operation failed',
        statusCode: 500,
    },
};