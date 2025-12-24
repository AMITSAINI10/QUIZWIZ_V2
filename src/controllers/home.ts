import { Request, Response } from 'express';
import db from '../db/index.js';

function index(_req: Request, res: Response) {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  const quizzes = db
    .prepare(
      `SELECT q.*, c.name AS category_name
       FROM quizzes q JOIN categories c ON q.category_id = c.id
       ORDER BY q.id DESC LIMIT 8`
    )
    .all();
  res.render('home', { title: 'QUIZWIZ', categories, quizzes });
}

export default { index };





