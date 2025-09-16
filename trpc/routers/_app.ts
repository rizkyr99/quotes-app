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

const updateQuoteSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Text is required').optional(),
  authorId: z.string().nullable().optional(), // undefined = keep, null = clear, string = connect
  source: z
    .object({
      type: z.enum([
        'YOUTUBE',
        'BOOK',
        'ARTICLE',
        'PODCAST',
        'SPEECH',
        'INTERVIEW',
        'DOCUMENTARY',
        'WEBSITE',
        'OTHER',
      ]),
      title: z.string(),
      url: z.url('Invalid URL format').optional().or(z.literal('')),
      timestamp: z.string().optional(),
      channel: z.string().optional(),
      author: z.string().optional(),
      publisher: z.string().optional(),
      year: z.number().min(1000).max(new Date().getFullYear()).optional(),
      isbn: z.string().optional(),
    })
    .nullable() // null → delete existing source
    .optional(), // undefined → leave as-is
  existingTagIds: z.array(z.string()).optional(),
  newTagNames: z.array(z.string().min(1)).optional(),
});

const deleteQuoteSchema = z.object({
  id: z.string(),
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
  updateQuote: baseProcedure
    .input(updateQuoteSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // Ensure the quote belongs to the caller
      const current = await prisma.quote.findFirst({
        where: { id: input.id, createdById: ctx.auth.userId },
        include: { source: { select: { id: true } } },
      });
      if (!current) throw new TRPCError({ code: 'NOT_FOUND' });

      // Handle tags replacement if arrays are provided
      let connectTagIds: string[] | undefined = undefined;
      if (input.existingTagIds || input.newTagNames) {
        const normalizedNew = Array.from(
          new Set(
            (input.newTagNames ?? [])
              .map((n) => n.trim())
              .filter(Boolean)
              .map((n) => n.toLowerCase())
          )
        );
        const created = await Promise.all(
          normalizedNew.map((nameLower) =>
            prisma.tag.upsert({
              where: { name: nameLower },
              update: {},
              create: { name: nameLower },
              select: { id: true },
            })
          )
        );
        connectTagIds = Array.from(
          new Set([
            ...(input.existingTagIds ?? []),
            ...created.map((t) => t.id),
          ])
        );
      }

      // Prepare fields
      const textUpdate =
        typeof input.text === 'string'
          ? { text: input.text.trim() }
          : undefined;

      const authorUpdate =
        input.authorId === undefined
          ? undefined // keep current
          : input.authorId === null
          ? { author: { disconnect: true } } // clear
          : { author: { connect: { id: input.authorId } } }; // connect new

      const src =
        input.source === undefined
          ? undefined // keep current
          : input.source === null
          ? { source: current.source ? { delete: true } : undefined }
          : {
              source: {
                upsert: {
                  update: {
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
                  },
                  create: {
                    type: input.source.type,
                    title: input.source.title ?? '',
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
                  },
                },
              },
            };

      const tagUpdate =
        connectTagIds === undefined
          ? undefined
          : {
              // replace the whole set
              tags: {
                deleteMany: {}, // remove all existing join rows
                create: connectTagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              },
            };

      const updated = await prisma.quote.update({
        where: { id: input.id },
        data: {
          ...textUpdate,
          ...(authorUpdate ?? {}),
          ...(src ?? {}),
          ...(tagUpdate ?? {}),
        },
        include: {
          author: true,
          tags: { include: { tag: { select: { id: true, name: true } } } },
          source: true,
        },
      });

      return updated;
    }),

  deleteQuote: baseProcedure
    .input(deleteQuoteSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // Constrain by owner so you don't delete others' quotes
      const quote = await prisma.quote.findFirst({
        where: { id: input.id, createdById: ctx.auth.userId },
        include: { source: { select: { id: true } } },
      });
      if (!quote) throw new TRPCError({ code: 'NOT_FOUND' });

      // Remove joins (and source if you don't have cascade)
      await prisma.$transaction([
        prisma.quoteTag.deleteMany({ where: { quoteId: input.id } }),
        prisma.quote.delete({ where: { id: input.id } }),
      ]);

      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
