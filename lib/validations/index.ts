import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { schemas } from '../api';

type SchemaKey = keyof typeof schemas;
type InferSchemaType<T extends SchemaKey> = z.infer<(typeof schemas)[T]>;

export function validate<T extends SchemaKey>(
  schemaKey: T,
  data: unknown
): InferSchemaType<T> {
  const schema = schemas[schemaKey];
  const result = schema.safeParse(data);

  if (!result.success) {
    const validationError = fromZodError(result.error, {
      prefix: 'Validation error',
      prefixSeparator: ': ',
    });
    throw validationError;
  }

  return result.data;
}

export function validatePartial<T extends SchemaKey>(
  schemaKey: T,
  data: unknown
): Partial<InferSchemaType<T>> {
  const schema = schemas[schemaKey].partial();
  const result = schema.safeParse(data);

  if (!result.success) {
    const validationError = fromZodError(result.error, {
      prefix: 'Validation error',
      prefixSeparator: ': ',
    });
    throw validationError;
  }

  return result.data as Partial<InferSchemaType<T>>;
}