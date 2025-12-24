// MongoDB seed version
import { initMongo } from '../db/mongo.js';

const categories = [
  { name: 'JavaScript Basics', slug: 'javascript-basics' },
  { name: 'Node.js & Express', slug: 'node-express' },
  { name: 'Computer Science', slug: 'computer-science' },
  { name: 'General Knowledge', slug: 'general-knowledge' }
];

const quizzes = [
  {
    categorySlug: 'javascript-basics',
    title: 'JS Fundamentals',
    description: 'Variables, types, and control flow.',
    difficulty: 'easy',
    questions: [
      {
        prompt: 'Which keyword declares a block-scoped variable?',
        type: 'single',
        choices: [
          { text: 'var', correct: 0 },
          { text: 'let', correct: 1 },
          { text: 'function', correct: 0 },
          { text: 'const', correct: 1 }
        ]
      },
      {
        prompt: 'What is the typeof null?',
        type: 'single',
        choices: [
          { text: 'object', correct: 1 },
          { text: 'null', correct: 0 },
          { text: 'undefined', correct: 0 },
          { text: 'boolean', correct: 0 }
        ]
      },
      {
        prompt: 'Which is NOT a primitive type in JS?',
        type: 'single',
        choices: [
          { text: 'symbol', correct: 0 },
          { text: 'bigint', correct: 0 },
          { text: 'function', correct: 1 },
          { text: 'string', correct: 0 }
        ]
      },
      {
        prompt: 'Select all truthy values:',
        type: 'multiple',
        choices: [
          { text: '0', correct: 0 },
          { text: '"0"', correct: 1 },
          { text: '[]', correct: 1 },
          { text: 'null', correct: 0 }
        ]
      },
      {
        prompt: 'Which creates a constant binding?',
        type: 'single',
        choices: [
          { text: 'const', correct: 1 },
          { text: 'let', correct: 0 },
          { text: 'var', correct: 0 },
          { text: 'static', correct: 0 }
        ]
      }
    ]
  },
  {
    categorySlug: 'node-express',
    title: 'Node.js & Express',
    description: 'Server-side JS, modules, and middleware.',
    difficulty: 'medium',
    questions: [
      {
        prompt: 'CommonJS uses which function to import modules?',
        type: 'single',
        choices: [
          { text: 'require()', correct: 1 },
          { text: 'import', correct: 0 },
          { text: 'include()', correct: 0 },
          { text: 'use()', correct: 0 }
        ]
      },
      {
        prompt: 'Which middleware secures Express with sensible defaults?',
        type: 'single',
        choices: [
          { text: 'helmet', correct: 1 },
          { text: 'morgan', correct: 0 },
          { text: 'compression', correct: 0 },
          { text: 'cookie-parser', correct: 0 }
        ]
      },
      {
        prompt: 'What method defines a route that responds to GET in Express?',
        type: 'single',
        choices: [
          { text: 'app.get()', correct: 1 },
          { text: 'app.route()', correct: 0 },
          { text: 'app.fetch()', correct: 0 },
          { text: 'app.listen()', correct: 0 }
        ]
      },
      {
        prompt: 'Select all middleware from this list:',
        type: 'multiple',
        choices: [
          { text: 'express.json()', correct: 1 },
          { text: 'express.urlencoded()', correct: 1 },
          { text: 'res.render()', correct: 0 },
          { text: 'next()', correct: 0 }
        ]
      },
      {
        prompt: 'What port does Express default to in this app?',
        type: 'single',
        choices: [
          { text: '3000', correct: 1 },
          { text: '8080', correct: 0 },
          { text: '80', correct: 0 },
          { text: '5000', correct: 0 }
        ]
      }
    ]
  },
  {
    categorySlug: 'computer-science',
    title: 'Data Structures',
    description: 'Arrays, stacks, queues, trees.',
    difficulty: 'medium',
    questions: [
      {
        prompt: 'Which has LIFO access?',
        type: 'single',
        choices: [
          { text: 'Queue', correct: 0 },
          { text: 'Stack', correct: 1 },
          { text: 'Linked List', correct: 0 },
          { text: 'Heap', correct: 0 }
        ]
      },
      {
        prompt: 'Which is typically FIFO?',
        type: 'single',
        choices: [
          { text: 'Queue', correct: 1 },
          { text: 'Stack', correct: 0 },
          { text: 'Tree', correct: 0 },
          { text: 'Graph', correct: 0 }
        ]
      },
      {
        prompt: 'Select all tree traversals:',
        type: 'multiple',
        choices: [
          { text: 'In-order', correct: 1 },
          { text: 'Breadth-first', correct: 1 },
          { text: 'Binary search', correct: 0 },
          { text: 'Dijkstra', correct: 0 }
        ]
      },
      {
        prompt: 'Which structure offers O(1) average lookup by key?',
        type: 'single',
        choices: [
          { text: 'Hash map', correct: 1 },
          { text: 'Array', correct: 0 },
          { text: 'Stack', correct: 0 },
          { text: 'Queue', correct: 0 }
        ]
      }
    ]
  },
  {
    categorySlug: 'general-knowledge',
    title: 'World Capitals',
    description: 'Name the capitals.',
    difficulty: 'easy',
    questions: [
      {
        prompt: 'Capital of France?',
        type: 'single',
        choices: [
          { text: 'Madrid', correct: 0 },
          { text: 'Paris', correct: 1 },
          { text: 'Berlin', correct: 0 },
          { text: 'Rome', correct: 0 }
        ]
      },
      {
        prompt: 'Capital of Japan?',
        type: 'single',
        choices: [
          { text: 'Tokyo', correct: 1 },
          { text: 'Osaka', correct: 0 },
          { text: 'Kyoto', correct: 0 },
          { text: 'Nagoya', correct: 0 }
        ]
      },
      {
        prompt: 'Select all that are capitals:',
        type: 'multiple',
        choices: [
          { text: 'Ottawa', correct: 1 },
          { text: 'Toronto', correct: 0 },
          { text: 'Canberra', correct: 1 },
          { text: 'Sydney', correct: 0 }
        ]
      },
      {
        prompt: 'Capital of India?',
        type: 'single',
        choices: [
          { text: 'Mumbai', correct: 0 },
          { text: 'New Delhi', correct: 1 },
          { text: 'Bengaluru', correct: 0 },
          { text: 'Kolkata', correct: 0 }
        ]
      }
    ]
  }
];

let nextId = 1;
function genId() { return nextId++; }

async function seedMongo() {
  for (const c of categories) {
    await db.collection('categories').updateOne(
      { slug: c.slug },
      { $setOnInsert: { id: genId(), name: c.name, slug: c.slug } },
      { upsert: true }
    );
  }

  for (const qz of quizzes) {
    const cat = await db.collection('categories').findOne({ slug: qz.categorySlug }) as any;
    const quizId = genId();
    await db.collection('quizzes').updateOne(
      { id: quizId },
      { $set: { id: quizId, category_id: cat.id, category_name: cat.name, category_slug: cat.slug, title: qz.title, description: qz.description, difficulty: qz.difficulty } },
      { upsert: true }
    );
    for (const q of qz.questions) {
      const questionId = genId();
      await db.collection('questions').updateOne(
        { id: questionId },
        { $set: { id: questionId, quiz_id: quizId, prompt: q.prompt, type: q.type } },
        { upsert: true }
      );
      for (const ch of q.choices) {
        const choiceId = genId();
        await db.collection('choices').updateOne(
          { id: choiceId },
          { $set: { id: choiceId, question_id: questionId, text: ch.text, is_correct: ch.correct } },
          { upsert: true }
        );
      }
    }
  }
}

const db = await initMongo();
await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
await db.collection('quizzes').createIndex({ id: 1 }, { unique: true });
await db.collection('questions').createIndex({ id: 1 }, { unique: true });
await db.collection('choices').createIndex({ id: 1 }, { unique: true });
await seedMongo();
console.log('Mongo database seeded successfully.');

