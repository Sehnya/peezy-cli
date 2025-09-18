import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
    },
  });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Getting Started with Prisma',
        content: 'Prisma is a next-generation ORM for Node.js and TypeScript.',
        published: true,
        authorId: user1.id,
      },
      {
        title: 'Building APIs with Express',
        content: 'Express.js is a minimal and flexible Node.js web application framework.',
        published: false,
        authorId: user2.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
