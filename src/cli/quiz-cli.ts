#!/usr/bin/env node
import readline from 'readline';
import db from '../db/index.js';
type QuestionRow = { id: number; quiz_id: number; prompt: string; type: 'single' | 'multiple' };
type ChoiceRow = { id: number; question_id: number; text: string; is_correct: 0 | 1 };

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function run() {
  console.log('Welcome to QUIZWIZ CLI!');
  const quizzes = db.prepare('SELECT id, title FROM quizzes ORDER BY id').all();
  quizzes.forEach((q: any) => console.log(`${q.id}. ${q.title}`));
  const id = Number(await ask('Pick quiz id: '));
  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id=?').all(id) as QuestionRow[];
  let score = 0;
  for (const q of questions) {
    console.log(`\n${q.prompt}`);
    const choices = db.prepare('SELECT * FROM choices WHERE question_id=?').all(q.id) as ChoiceRow[];
    choices.forEach((c, i: number) => console.log(`${i + 1}) ${c.text}`));
    const ans = Number(await ask('Your answer number: '));
    const selected = choices[ans - 1];
    if (selected && selected.is_correct) score++;
  }
  console.log(`\nScore: ${score} / ${questions.length}`);
  rl.close();
}

run();

