import { NextFunction, Request, Response } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any).user) return next();
  if (req.accepts('json')) return res.status(401).json({ error: 'Authentication required' });
  res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any).user;
  if (user && user.is_admin) return next();
  return res.status(403).render('error', { title: 'Forbidden', status: 403, message: 'Admins only' });
}





