import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from 'shared';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'body';
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(issue.message);
        }

        const response: ApiResponse = {
          success: false,
          error: {
            message: 'Validation failed',
            details,
          },
        };
        res.status(400).json(response);
        return;
      }
      next(error);
    }
  };
};
