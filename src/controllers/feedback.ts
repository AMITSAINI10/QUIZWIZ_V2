import { Request, Response } from 'express';

function index(_req: Request, res: Response) {
  res.render('feedback', { title: 'Feedback' });
}

export default { index };





