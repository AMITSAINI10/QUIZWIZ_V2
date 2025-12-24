// Script to delete specific quizzes
import { initMongo, closeMongo } from '../db/mongo.js';

const quizzesToDelete = [
  'Capitals',
  'kuch bhi',
  'cvbn',
  'erwf'
];

async function deleteQuizzes() {
  const db = await initMongo();
  
  console.log('Finding quizzes to delete...');
  
  for (const title of quizzesToDelete) {
    const quiz = await db.collection('quizzes').findOne({ title }) as any;
    
    if (!quiz) {
      console.log(`Quiz "${title}" not found, skipping...`);
      continue;
    }
    
    console.log(`Deleting quiz: "${title}" (ID: ${quiz.id})...`);
    
    // Get all questions for this quiz
    const questions = await db.collection('questions').find({ quiz_id: quiz.id }).toArray() as any[];
    const questionIds = questions.map(q => q.id);
    
    // Delete choices
    if (questionIds.length > 0) {
      const deleteChoicesResult = await db.collection('choices').deleteMany({ question_id: { $in: questionIds } });
      console.log(`  Deleted ${deleteChoicesResult.deletedCount} choices`);
    }
    
    // Delete questions
    if (questionIds.length > 0) {
      const deleteQuestionsResult = await db.collection('questions').deleteMany({ quiz_id: quiz.id });
      console.log(`  Deleted ${deleteQuestionsResult.deletedCount} questions`);
    }
    
    // Delete the quiz
    const deleteQuizResult = await db.collection('quizzes').deleteOne({ id: quiz.id });
    console.log(`  Deleted quiz: ${deleteQuizResult.deletedCount > 0 ? 'Success' : 'Failed'}`);
  }
  
  console.log('\nDeletion complete!');
  await closeMongo();
  process.exit(0);
}

deleteQuizzes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

