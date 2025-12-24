import { NextFunction, Request, Response } from 'express';

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction) {
  const err: any = new Error(`Not Found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (req.accepts('json')) {
    res.status(status).json({ error: message });
    return;
  }
  res.status(status).render('error', { title: 'Error', status, message });
}


