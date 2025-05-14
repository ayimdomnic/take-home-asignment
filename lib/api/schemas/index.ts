import { loginSchema, registerSchema } from './auth';
import { fileSchema, createFileSchema, updateFileSchema, fileUploadSchema } from './file';
import { folderSchema, createFolderSchema, updateFolderSchema, folderQuerySchema } from './folder';
import { cuidSchema, emailSchema, paginationSchema } from './general';
import { accountSchema, CreateUserSchema, sessionSchema, UpdateUserSchema, UserSchema, verificationTokenSchema } from './user';

export * from './file';
export * from './general';
export * from './user';
export * from './folder'

export const schemas = {
    user: UserSchema,
    createUser: CreateUserSchema,
    updateUser: UpdateUserSchema,
    account: accountSchema,
    session: sessionSchema,
    verificationToken: verificationTokenSchema,
    folder: folderSchema,
    createFolder: createFolderSchema,
    updateFolder: updateFolderSchema,
    file: fileSchema,
    createFile: createFileSchema,
    updateFile: updateFileSchema,
    fileUpload: fileUploadSchema,
    login: loginSchema,
    register: registerSchema,
    pagination: paginationSchema,
    folderQuery: folderQuerySchema,
    cuid: cuidSchema
};