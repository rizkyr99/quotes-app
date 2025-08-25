import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import prisma from '@/lib/prisma';
import { TRPCError } from '@trpc/server';

const createAuthorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
});

const createQuoteSchema = z.object({
  text: z.string().min(5),
  authorId: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  existingTagIds: z.array(z.string()).default([]),
  newTagNames: z.array(z.string().min(1)).default([]),
});

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
  getAuthors: baseProcedure.query(async () => {
    return prisma.author.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }),
  createAuthor: baseProcedure
    .input(createAuthorSchema)
    .mutation(async ({ input }) => {
      return prisma.author.create({
        data: {
          name: input.name,
          bio: input.bio,
        },
      });
    }),
  getQuotes: baseProcedure.query(async ({ ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return prisma.quote.findMany({
      where: {
        createdById: ctx.auth.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: true, // if you want author name too
        tags: {
          include: {
            tag: { select: { id: true, name: true } }, // <- important
          },
        },
      },
    });
  }),
  createQuote: baseProcedure
    .input(createQuoteSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const normalized = Array.from(
        new Set(
          input.newTagNames
            .map((n) => n.trim())
            .filter(Boolean)
            .map((n) => n.toLowerCase())
        )
      );

      const created = await Promise.all(
        normalized.map((nameLower) =>
          prisma.tag.upsert({
            where: {
              name: nameLower,
            },
            update: {},
            create: {
              name: nameLower,
            },
            select: {
              id: true,
            },
          })
        )
      );
      const connectTagIds = Array.from(
        new Set([...input.existingTagIds, ...created.map((t) => t.id)])
      );

      return prisma.quote.create({
        data: {
          text: input.text.trim(),
          author: input.authorId
            ? {
                connect: {
                  id: input.authorId,
                },
              }
            : undefined,
          source: input.source,
          tags:
            connectTagIds.length > 0
              ? {
                  create: connectTagIds.map((tagId) => ({
                    tag: { connect: { id: tagId } },
                  })),
                }
              : undefined,
          createdById: ctx.auth.userId,
        },
      });

      return;
    }),
});

export type AppRouter = typeof appRouter;
