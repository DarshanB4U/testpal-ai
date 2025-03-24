import prisma from './prisma';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Export the Prisma client instance
export { prisma };
