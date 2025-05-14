export const AuthErrors = {
    INVALID_CREDENTIALS: {
        code: "AUTH-001",
        message: "Invalid email or password"
    },
    MISSING_CREDENTIALS: {
        code: "AUTH-002",
        message: "Email and Password Are Required"
    },
    USER_NOT_FOUND: {
        code: "AUTH-003",
        message: "No account found with this email"
    },
    OAUTH_ACCOUNT_NOT_LINKED: {
        code: "AUTH-004",
        message: "Account not linked. please signin with the original provider"
    },
    UNKNOWN_ERROR: {
        code: "AUTH-000",
        message: "An unknow error occurred"
    }
} as const;


export class AuthError extends Error {
    constructor(public code: string, message: string) {
        super(message)
        this.name = "AuthError"
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message
        }
    }
}