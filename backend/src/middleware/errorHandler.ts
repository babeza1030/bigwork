import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: (err as any).issues?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })) || [],
    });
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        message: 'A record with this value already exists.',
        field: prismaError.meta?.target,
      });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({ message: 'Record not found.' });
      return;
    }
  }

  res.status(500).json({
    message: err.message || 'Internal server error',
  });
};
