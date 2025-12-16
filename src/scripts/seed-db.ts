/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// scripts/seed-db.ts
import 'reflect-metadata'; // Add this for TypeORM decorators
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

async function seed() {
  console.log('🌱 Starting SQLite database seeding...');

  // Create SQLite data source
  const dataSource = new DataSource({
    type: 'sqlite',
    database: './database.sqlite', // SQLite file will be created here
    entities: [User],
    synchronize: true, // Creates tables automatically
    logging: true, // Enable logging to see what's happening
  });

  await dataSource.initialize();

  try {
    const userRepository = dataSource.getRepository(User);

    // Check if users exist
    const count = await userRepository.count();

    if (count === 0) {
      console.log('📝 Creating users...');

      const hashedPassword = await bcrypt.hash('password123', 10);

      await userRepository.save([
        {
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin', // Add role field
        },
        {
          username: 'user',
          email: 'user@example.com',
          password: hashedPassword,
          role: 'user',
        },
        {
          username: 'john_doe',
          email: 'john@example.com',
          password: hashedPassword,
          role: 'user',
        },
      ]);

      console.log('✅ Database seeded with 3 users');
      console.log('📁 SQLite database created at: ./database.sqlite');
    } else {
      console.log(`📊 Database already has ${count} users, skipping...`);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed
seed();
