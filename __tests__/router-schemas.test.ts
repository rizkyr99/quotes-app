import { z } from 'zod';

// Mirrors the schemas in trpc/routers/_app.ts
const createAuthorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
});

const createQuoteSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  authorId: z.string().nullable().optional(),
  source: z
    .object({
      type: z.enum([
        'YOUTUBE', 'BOOK', 'ARTICLE', 'PODCAST', 'SPEECH',
        'INTERVIEW', 'DOCUMENTARY', 'WEBSITE', 'OTHER',
      ]).default('OTHER'),
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

const getQuotesSchema = z
  .object({
    tag: z.string().optional(),
    sort: z.enum(['newest', 'oldest']).optional(),
    search: z.string().optional(),
  })
  .optional();

describe('createAuthorSchema', () => {
  it('accepts a name', () => {
    expect(createAuthorSchema.safeParse({ name: 'Marcus Aurelius' }).success).toBe(true);
  });

  it('accepts name with optional bio', () => {
    expect(createAuthorSchema.safeParse({ name: 'Marcus Aurelius', bio: 'Roman emperor' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createAuthorSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Name is required');
  });
});

describe('createQuoteSchema', () => {
  const base = { text: 'Test quote', existingTagIds: [], newTagNames: [] };

  it('accepts minimal input', () => {
    expect(createQuoteSchema.safeParse(base).success).toBe(true);
  });

  it('rejects empty text', () => {
    const result = createQuoteSchema.safeParse({ ...base, text: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Text is required');
  });

  it('accepts null authorId (no author)', () => {
    expect(createQuoteSchema.safeParse({ ...base, authorId: null }).success).toBe(true);
  });

  it('accepts string authorId', () => {
    expect(createQuoteSchema.safeParse({ ...base, authorId: 'author-cuid-123' }).success).toBe(true);
  });

  it('defaults source type to OTHER', () => {
    const result = createQuoteSchema.safeParse({ ...base, source: { title: 'Test' } });
    expect(result.success).toBe(true);
    expect((result as { data: { source?: { type: string } } }).data?.source?.type).toBe('OTHER');
  });

  it('accepts new tag names', () => {
    const result = createQuoteSchema.safeParse({ ...base, newTagNames: ['philosophy', 'stoicism'] });
    expect(result.success).toBe(true);
  });

  it('rejects empty string in newTagNames', () => {
    const result = createQuoteSchema.safeParse({ ...base, newTagNames: [''] });
    expect(result.success).toBe(false);
  });
});

describe('getQuotesSchema', () => {
  it('accepts undefined (no filters)', () => {
    expect(getQuotesSchema.safeParse(undefined).success).toBe(true);
  });

  it('accepts search string', () => {
    expect(getQuotesSchema.safeParse({ search: 'stoicism' }).success).toBe(true);
  });

  it('accepts tag filter', () => {
    expect(getQuotesSchema.safeParse({ tag: 'philosophy' }).success).toBe(true);
  });

  it('accepts valid sort values', () => {
    expect(getQuotesSchema.safeParse({ sort: 'newest' }).success).toBe(true);
    expect(getQuotesSchema.safeParse({ sort: 'oldest' }).success).toBe(true);
  });

  it('rejects invalid sort value', () => {
    expect(getQuotesSchema.safeParse({ sort: 'random' }).success).toBe(false);
  });

  it('accepts combined filters', () => {
    expect(getQuotesSchema.safeParse({ tag: 'stoicism', sort: 'newest', search: 'virtue' }).success).toBe(true);
  });
});
