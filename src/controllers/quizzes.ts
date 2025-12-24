import { Request, Response } from 'express';
// import db from '../db/index.js';
import { getDb } from '../db/mongo.js';
import Joi from 'joi';
import { createRequire } from 'module';
import { requireAuth } from '../middleware/auth.js';
// Interop example: import CommonJS module in ESM/TS
const requireCjs = createRequire(import.meta.url);
const { formatScore } = requireCjs('../modules/cjs-utils.cjs');

type QuizRow = { id: number; title: string; description: string; difficulty: string; category_id: number; category_name?: string; created_by?: number };
type QuestionRow = { id: number; quiz_id: number; prompt: string; type: 'single' | 'multiple' };
type ChoiceRow = { id: number; question_id: number; text: string; is_correct: 0 | 1 };

async function list(req: Request, res: Response) {
  const { category, q } = req.query as { category?: string; q?: string };
  const db = getDb();
  const collection = db.collection('quizzes');
  const filter: any = {};
  if (category) filter.category_slug = category;
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } }
  ];
  const rows = await collection.find(filter).sort({ id: -1 }).toArray() as any as QuizRow[];
  const user = (req.session as any).user;
  
  // Add isCreator flag to each quiz
  const quizzesWithCreator = rows.map((quiz: any) => ({
    ...quiz,
    isCreator: user && quiz.created_by === user.id
  }));
  
  const isApi = req.baseUrl.startsWith('/api');
  if (isApi) return res.json(rows);
  res.render('quizzes/list', { title: 'Quizzes', quizzes: quizzesWithCreator, query: q, user });
}

async function detail(req: Request, res: Response) {
  const id = Number(req.params.id);
  const db = getDb();
  const quiz = await db.collection('quizzes').findOne({ id }) as any as QuizRow | null;
  const questions = await db.collection('questions').find({ quiz_id: id }).toArray() as any as QuestionRow[];
  const qIds = questions.map(q => q.id);
  const choices = await db.collection('choices').find({ question_id: { $in: qIds } }).toArray() as any as ChoiceRow[];
  const questionIdToChoices: Record<number, ChoiceRow[]> = {};
  for (const choice of choices) {
    questionIdToChoices[choice.question_id] = questionIdToChoices[choice.question_id] || [];
    questionIdToChoices[choice.question_id].push(choice);
  }
  if (!quiz) {
    return res.status(404).render('error', { title: 'Not Found', status: 404, message: 'Quiz not found' });
  }
  const user = (req.session as any).user;
  const isCreator = user && quiz.created_by === user.id;
  const isApi = req.baseUrl.startsWith('/api');
  if (isApi) return res.json({ quiz, questions, choices: questionIdToChoices, isCreator });
  res.render('quizzes/detail', { title: quiz.title, quiz, questions, choices: questionIdToChoices, isCreator });
}

async function play(req: Request, res: Response) {
  const id = Number(req.params.id);
  const db = getDb();
  const quiz = await db.collection('quizzes').findOne({ id }) as any as QuizRow | null;
  const questions = await db.collection('questions').find({ quiz_id: id }).toArray() as any as QuestionRow[];
  const qIds = questions.map(q => q.id);
  const choices = await db.collection('choices').find({ question_id: { $in: qIds } }).toArray() as any as ChoiceRow[];
  const questionIdToChoices: Record<number, ChoiceRow[]> = {};
  for (const choice of choices) {
    questionIdToChoices[choice.question_id] = questionIdToChoices[choice.question_id] || [];
    questionIdToChoices[choice.question_id].push(choice);
  }
  if (!quiz) {
    return res.redirect('/quizzes');
  }
  res.render('quizzes/play', { title: quiz.title, quiz, questions, choices: questionIdToChoices });
}

const submitSchema = Joi.object({
  answers: Joi.object().pattern(Joi.string(), Joi.alternatives(Joi.number(), Joi.array().items(Joi.number()))).required(),
});

async function submit(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { error, value } = submitSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const db = getDb();
  const questions = await db.collection('questions').find({ quiz_id: id }).toArray() as any as QuestionRow[];
  let score = 0;
  for (const q of questions) {
    const correctChoices = (await db.collection('choices').find({ question_id: q.id, is_correct: 1 }).project({ id: 1 }).toArray() as any as { id: number }[])
      .map((r) => r.id).sort();
    const userAns = value.answers[String(q.id)];
    const userChoiceIds = Array.isArray(userAns) ? userAns.map(Number) : [Number(userAns)];
    userChoiceIds.sort();
    // For single-choice questions, accept any one correct option
    if (q.type === 'single') {
      if (userChoiceIds.length === 1 && correctChoices.includes(userChoiceIds[0])) {
        score += 1;
      }
    } else {
      if (JSON.stringify(correctChoices) === JSON.stringify(userChoiceIds)) score += 1;
    }
  }
  const user = (req.session as any).user;
  await db.collection('attempts').insertOne({ quiz_id: id, score, total: questions.length, user_id: user?.id ?? null, created_at: new Date() });
  return res.json({ score, total: questions.length, label: formatScore(score, questions.length) });
}

async function showAdd(req: Request, res: Response) {
  const db = getDb();
  const categories = await db.collection('categories').find({}).toArray();
  res.render('quizzes/add', { title: 'Add Quiz', categories });
}

const addQuizSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('easy'),
  category_id: Joi.number().integer().required(),
  questions: Joi.array().items(
    Joi.object({
      prompt: Joi.string().min(1).required(),
      type: Joi.string().valid('single', 'multiple').required(),
      choices: Joi.array().items(
        Joi.object({
          text: Joi.string().min(1).required(),
          is_correct: Joi.boolean().required()
        })
      ).min(2).max(4).required()
    })
  ).min(1).required()
});

async function add(req: Request, res: Response) {
  // Handle JSON questions if sent as string, or if already parsed
  let body = req.body;
  if (typeof body.questions === 'string') {
    try {
      body.questions = JSON.parse(body.questions);
    } catch (e) {
      const db = getDb();
      const categories = await db.collection('categories').find({}).toArray();
      return res.status(400).render('quizzes/add', { title: 'Add Quiz', categories, error: 'Invalid questions format' });
    }
  }
  
  // Ensure category_id is a number
  if (body.category_id && typeof body.category_id === 'string') {
    body.category_id = Number(body.category_id);
  }
  
  // Validate and ensure all choices have is_correct as boolean
  if (Array.isArray(body.questions)) {
    body.questions = body.questions.map((q: any) => {
      if (Array.isArray(q.choices)) {
        q.choices = q.choices.map((c: any) => {
          // Ensure is_correct is a boolean
          if (typeof c.is_correct === 'string') {
            c.is_correct = c.is_correct === 'true' || c.is_correct === true;
          }
          if (typeof c.is_correct !== 'boolean') {
            c.is_correct = Boolean(c.is_correct);
          }
          return c;
        });
      }
      return q;
    });
  }
  
  const { error, value } = addQuizSchema.validate(body, { abortEarly: false });
  if (error) {
    const db = getDb();
    const categories = await db.collection('categories').find({}).toArray();
    // Log the error details for debugging
    console.error('Validation error:', error.details);
    console.error('Received body:', JSON.stringify(body, null, 2));
    return res.status(400).render('quizzes/add', { title: 'Add Quiz', categories, error: error.details.map((d: any) => d.message).join(', ') });
  }

  const user = (req.session as any).user;
  if (!user) {
    return res.status(401).redirect('/login');
  }

  const db = getDb();
  
  // Get next IDs
  const maxQuizId = await db.collection('quizzes').findOne({}, { sort: { id: -1 } }) as any;
  const maxQuestionId = await db.collection('questions').findOne({}, { sort: { id: -1 } }) as any;
  const maxChoiceId = await db.collection('choices').findOne({}, { sort: { id: -1 } }) as any;
  
  let nextQuizId = (maxQuizId?.id || 0) + 1;
  let nextQuestionId = (maxQuestionId?.id || 0) + 1;
  let nextChoiceId = (maxChoiceId?.id || 0) + 1;

  // Get category info
  const category = await db.collection('categories').findOne({ id: value.category_id }) as any;
  if (!category) {
    const categories = await db.collection('categories').find({}).toArray();
    return res.status(400).render('quizzes/add', { title: 'Add Quiz', categories, error: 'Invalid category' });
  }

  // Validate that each question has exactly 4 choices
  for (const q of value.questions) {
    if (q.choices.length !== 4) {
      const categories = await db.collection('categories').find({}).toArray();
      return res.status(400).render('quizzes/add', { title: 'Add Quiz', categories, error: 'Each question must have exactly 4 options' });
    }
    // Validate that at least one choice is correct
    const hasCorrect = q.choices.some((c: any) => c.is_correct);
    if (!hasCorrect) {
      const categories = await db.collection('categories').find({}).toArray();
      return res.status(400).render('quizzes/add', { title: 'Add Quiz', categories, error: 'Each question must have at least one correct answer' });
    }
  }

  try {
    // Create quiz
    const quizId = nextQuizId++;
    await db.collection('quizzes').insertOne({
      id: quizId,
      title: value.title,
      description: value.description || '',
      difficulty: value.difficulty,
      category_id: value.category_id,
      category_name: category.name,
      category_slug: category.slug,
      created_by: user.id
    });

    // Create questions and choices
    for (const q of value.questions) {
      const questionId = nextQuestionId++;
      await db.collection('questions').insertOne({
        id: questionId,
        quiz_id: quizId,
        prompt: q.prompt,
        type: q.type
      });

      for (const ch of q.choices) {
        await db.collection('choices').insertOne({
          id: nextChoiceId++,
          question_id: questionId,
          text: ch.text,
          is_correct: ch.is_correct ? 1 : 0
        });
      }
    }

    // Check if request wants JSON response
    if (req.accepts('json')) {
      return res.json({ success: true, quizId, redirect: `/quizzes/${quizId}` });
    }
    
    res.redirect(`/quizzes/${quizId}`);
  } catch (err: any) {
    console.error('Error creating quiz:', err);
    const categories = await db.collection('categories').find({}).toArray();
    const errorMsg = err.message || 'Failed to create quiz. Please try again.';
    if (req.accepts('json')) {
      return res.status(500).json({ error: errorMsg });
    }
    return res.status(500).render('quizzes/add', { title: 'Add Quiz', categories, error: errorMsg });
  }
}

async function deleteQuiz(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = (req.session as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const db = getDb();
  const quiz = await db.collection('quizzes').findOne({ id }) as any as QuizRow | null;
  
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (quiz.created_by !== user.id) {
    return res.status(403).json({ error: 'Only the quiz creator can delete this quiz' });
  }

  // Delete quiz (cascade will delete questions and choices)
  await db.collection('quizzes').deleteOne({ id });
  // Also delete related questions and choices
  const questions = await db.collection('questions').find({ quiz_id: id }).toArray();
  const questionIds = questions.map((q: any) => q.id);
  if (questionIds.length > 0) {
    await db.collection('questions').deleteMany({ quiz_id: id });
    await db.collection('choices').deleteMany({ question_id: { $in: questionIds } });
  }
  // Note: We keep attempts for historical purposes, but they'll reference a deleted quiz

  if (req.accepts('json')) {
    return res.json({ success: true });
  }
  res.redirect('/quizzes');
}

async function leaderboard(req: Request, res: Response) {
  const id = Number(req.params.id);
  const db = getDb();
  const quiz = await db.collection('quizzes').findOne({ id }) as any as QuizRow | null;
  
  if (!quiz) {
    return res.status(404).render('error', { title: 'Not Found', status: 404, message: 'Quiz not found' });
  }

  // Get all attempts for this quiz
  const attempts = await db.collection('attempts').find({ quiz_id: id }).sort({ score: -1, created_at: 1 }).toArray() as any[];
  
  // Get user info for each attempt
  const userIds = Array.from(new Set(attempts.map((a: any) => a.user_id).filter((id: any) => id !== null)));
  const userMap = new Map<number, { name: string; email: string }>();
  
  if (userIds.length > 0) {
    // Since users are in SQLite, we need to import the SQLite db
    const sqliteDb = (await import('../db/index.js')).default;
    for (const userId of userIds) {
      const user = sqliteDb.prepare('SELECT name, email FROM users WHERE id = ?').get(userId) as any;
      if (user) {
        userMap.set(userId, { name: user.name || user.email, email: user.email });
      }
    }
  }

  // Attach user info to attempts
  const leaderboardData = attempts.map((attempt: any, index: number) => {
    const userInfo = attempt.user_id ? userMap.get(attempt.user_id) : null;
    return {
      ...attempt,
      rank: index + 1,
      userName: userInfo?.name || 'Anonymous',
      userEmail: userInfo?.email || ''
    };
  });

  res.render('quizzes/leaderboard', { title: `${quiz.title} - Leaderboard`, quiz, leaderboard: leaderboardData });
}

export default { list, detail, play, submit, showAdd, add, deleteQuiz, leaderboard };

