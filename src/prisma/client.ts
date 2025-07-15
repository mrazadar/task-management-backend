import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * @description Prisma Client instance for database interactions.
 * This is the main instance that is used by the application. It is
 * initialized in the `src/index.ts` file.
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient
 * @reference https://www.prisma.io/docs/concepts/components/prisma-client
 */
export default prisma;
