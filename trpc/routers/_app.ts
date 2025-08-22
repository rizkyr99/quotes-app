import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import prisma from '@/lib/prisma';

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return { greeting: `hello ${opts.input.text}` };
    }),
  getTags: baseProcedure.query(async () => {
    try {
      return await prisma.tag.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (e) {
      console.error('getTags failed:', e);
      // You can also throw a TRPCError if you like
      throw e;
    }
  }),
});

export type AppRouter = typeof appRouter;
