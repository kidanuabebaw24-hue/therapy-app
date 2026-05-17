import prisma from './src/config/prisma.js';

const exercises = [
  {
    title: 'Thought Record',
    description: 'The foundation of CBT. Learn to identify and challenge negative automatic thoughts by examining the evidence.',
    category: 'Cognitive Reframing',
    difficulty: 'beginner',
    estimatedTime: 12,
    isMandatory: true,
    questions: [
      { text: 'What was the situation?', order: 0, type: 'TEXT' },
      { text: 'How did you feel?', order: 1, type: 'TEXT' },
      { text: 'Rate your anxiety level (0-10)', order: 2, type: 'TEXT' },
      { text: 'What was the negative thought?', order: 3, type: 'TEXT' },
      { text: 'What is a more balanced way to think about this?', order: 4, type: 'TEXT' }
    ]
  },
  {
    title: 'Panic Recovery',
    description: 'A rapid response guide to help you manage and de-escalate acute panic symptoms.',
    category: 'Crisis Support',
    difficulty: 'intermediate',
    estimatedTime: 8,
    isMandatory: false,
    questions: [
      { text: 'Are you safe right now?', order: 0, type: 'TEXT' },
      { text: 'What physical sensations are you feeling?', order: 1, type: 'TEXT' },
      { text: 'Repeat after me: "This is a temporary surge of adrenaline. It will pass."', order: 2, type: 'TEXT' }
    ]
  },
  {
    title: '5-4-3-2-1 Grounding',
    description: 'Reconnect with the present moment using your five senses.',
    category: 'Grounding',
    difficulty: 'beginner',
    estimatedTime: 5,
    isMandatory: false,
    questions: [
      { text: 'Name 5 things you can see.', order: 0, type: 'TEXT' },
      { text: 'Name 4 things you can touch.', order: 1, type: 'TEXT' },
      { text: 'Name 3 things you can hear.', order: 2, type: 'TEXT' },
      { text: 'Name 2 things you can smell.', order: 3, type: 'TEXT' },
      { text: 'Name 1 thing you can taste.', order: 4, type: 'TEXT' }
    ]
  }
];

async function main() {
  console.log('Starting CBT seed...');
  let admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    admin = await prisma.user.findFirst();
  }
  if (!admin) {
    console.log('No user found to assign as creator.');
    return;
  }

  for (const ex of exercises) {
    const existing = await prisma.cBTExercise.findFirst({ where: { title: ex.title } });
    if (!existing) {
      const created = await prisma.cBTExercise.create({
        data: {
          title: ex.title,
          description: ex.description,
          category: ex.category,
          difficulty: ex.difficulty,
          estimatedTime: ex.estimatedTime,
          isMandatory: ex.isMandatory,
          createdById: admin.id,
          questions: {
            create: ex.questions
          }
        }
      });
      console.log('Created exercise:', created.title);
    } else {
      console.log('Exercise already exists:', ex.title);
    }
  }
  console.log('Seeding finished.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
