import { db } from '../config/database';
import { users, posts } from '../schema/schema';

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const [user1] = await db.insert(users).values({
    email: 'alice@example.com',
    name: 'Alice Johnson',
  }).returning();

  const [user2] = await db.insert(users).values({
    email: 'bob@example.com',
    name: 'Bob Smith',
  }).returning();

  // Create sample posts
  await db.insert(posts).values([
    {
      title: 'Getting Started with Drizzle',
      content: 'Drizzle is a lightweight and performant TypeScript ORM.',
      published: true,
      authorId: user1.id,
    },
    {
      title: 'Building APIs with Express',
      content: 'Express.js is a minimal and flexible Node.js web application framework.',
      published: false,
      authorId: user2.id,
    },
  ]);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  });
