import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * @description Prisma Client instance for database interactions.
 * @reference https://www.prisma.io/docs/concepts/components/prisma-client
 */
export default prisma;
