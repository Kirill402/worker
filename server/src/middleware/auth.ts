import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from 'shared';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse = {
      success: false,
      error: { message: 'Authentication required' },
    };
    res.status(401).json(response);
    return;
  }

  const token = authHeader.split(' ')[1];
  if (token.startsWith('mock-jwt-token-')) {
    req.userId = token.replace('mock-jwt-token-', '');
    next();
    return;
  }

  const response: ApiResponse = {
    success: false,
    error: { message: 'Invalid or expired token' },
  };
  res.status(401).json(response);
};
