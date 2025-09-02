import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import prisma from '@/lib/prisma';
import { TRPCError } from '@trpc/server';

const createAuthorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
});

const createQuoteSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  authorId: z.string().nullable().optional(),
  source: z
    .object({
      type: z
        .enum([
          'YOUTUBE',
          'BOOK',
          'ARTICLE',
          'PODCAST',
          'SPEECH',
          'INTERVIEW',
          'DOCUMENTARY',
          'WEBSITE',
          'OTHER',
        ])
        .default('OTHER'),
      title: z.string(),
      url: z.url('Invalid URL format').optional().or(z.literal('')),
      timestamp: z.string().optional(),
      channel: z.string().optional(),
      author: z.string().optional(),
      publisher: z.string().optional(),
      year: z.number().min(1000).max(new Date().getFullYear()).optional(),
      isbn: z.string().optional(),
    })
    .optional(),
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
  getQuotes: baseProcedure
    .input(
      z
        .object({
          tag: z.string().optional(),
          sort: z.enum(['newest', 'oldest']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      return prisma.quote.findMany({
        where: {
          createdById: ctx.auth.userId,
          ...(input?.tag
            ? {
                tags: {
                  some: { tag: { name: input.tag } },
                },
              }
            : {}),
        },
        orderBy: {
          createdAt: input?.sort === 'oldest' ? 'asc' : 'desc',
        },
        include: {
          author: true,
          tags: {
            include: {
              tag: { select: { id: true, name: true } },
            },
          },
          source: true,
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

      const src = input.source
        ? {
            type: input.source.type,
            title: input.source.title ?? null,
            url:
              input.source.url && input.source.url !== ''
                ? input.source.url
                : null,
            timestamp: input.source.timestamp ?? null,
            channel: input.source.channel ?? null,
            author: input.source.author ?? null,
            publisher: input.source.publisher ?? null,
            year: input.source.year ?? null,
            isbn: input.source.isbn ?? null,
          }
        : null;

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
          source: src ? { create: src } : undefined,
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
    }),
});

export type AppRouter = typeof appRouter;
