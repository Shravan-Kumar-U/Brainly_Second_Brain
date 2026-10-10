import { ApiError } from '../utils/ApiError.js';

/**
 * validate(schema)           → validates req.body  (cleaned result replaces req.body)
 * validate(schema, 'query')  → validates req.query (cleaned result in req.validated.query)
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ApiError(400, 'Validation failed', details));
  }

  req.validated = { ...req.validated, [source]: result.data };
  if (source === 'body') req.body = result.data;

  next();
};