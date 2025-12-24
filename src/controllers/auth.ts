import { Request, Response } from 'express';
import db from '../db/index.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(60).required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

function showLogin(req: Request, res: Response) {
  res.render('auth/login', { title: 'Login', next: req.query.next || '/' });
}

function showSignup(_req: Request, res: Response) {
  res.render('auth/signup', { title: 'Sign Up' });
}

async function signup(req: Request, res: Response) {
  const { error, value } = signupSchema.validate(req.body);
  if (error) return res.status(400).render('auth/signup', { title: 'Sign Up', error: error.message });
  const hash = await bcrypt.hash(value.password, 10);
  try {
    const info = db
      .prepare('INSERT INTO users (email, password_hash, name) VALUES (?,?,?)')
      .run(value.email, hash, value.name);
    (req.session as any).user = { id: Number(info.lastInsertRowid), email: value.email, name: value.name, is_admin: 0 };
    res.redirect('/');
  } catch (e: any) {
    res.status(400).render('auth/signup', { title: 'Sign Up', error: 'Email already in use' });
  }
}

async function login(req: Request, res: Response) {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).render('auth/login', { title: 'Login', error: error.message });
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(value.email) as any;
  if (!user) return res.status(400).render('auth/login', { title: 'Login', error: 'Invalid credentials' });
  const ok = await bcrypt.compare(value.password, user.password_hash);
  if (!ok) return res.status(400).render('auth/login', { title: 'Login', error: 'Invalid credentials' });
  (req.session as any).user = { id: user.id, email: user.email, name: user.name, is_admin: !!user.is_admin };
  res.redirect((req.query.next as string) || '/');
}

function logout(req: Request, res: Response) {
  req.session.destroy(() => res.redirect('/'));
}

function me(req: Request, res: Response) {
  res.json((req.session as any).user || null);
}

export default { showLogin, showSignup, signup, login, logout, me };



