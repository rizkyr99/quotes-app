import { formSchema } from '@/lib/schemas/quote';

describe('formSchema', () => {
  const validBase = {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    tags: [{ name: 'inspiration' }],
  };

  it('accepts valid quote without source', () => {
    const result = formSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('rejects empty text', () => {
    const result = formSchema.safeParse({ ...validBase, text: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Quote is required');
  });

  it('rejects empty tags array', () => {
    const result = formSchema.safeParse({ ...validBase, tags: [] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Please add at least one tag');
  });

  it('accepts valid YOUTUBE source', () => {
    const result = formSchema.safeParse({
      ...validBase,
      source: {
        type: 'YOUTUBE',
        title: 'Stanford Commencement 2005',
        url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
        channel: 'Stanford',
        timestamp: '11:22',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid BOOK source', () => {
    const result = formSchema.safeParse({
      ...validBase,
      source: {
        type: 'BOOK',
        title: 'Steve Jobs',
        author: 'Walter Isaacson',
        publisher: 'Simon & Schuster',
        year: 2011,
        isbn: '9781451648539',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL in source', () => {
    const result = formSchema.safeParse({
      ...validBase,
      source: {
        type: 'WEBSITE',
        title: 'Some Site',
        url: 'not-a-valid-url',
      },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Invalid URL format');
  });

  it('accepts empty string URL (treated as no URL)', () => {
    const result = formSchema.safeParse({
      ...validBase,
      source: {
        type: 'ARTICLE',
        title: 'Some Article',
        url: '',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects year below 1000', () => {
    const result = formSchema.safeParse({
      ...validBase,
      source: {
        type: 'BOOK',
        title: 'Ancient Text',
        year: 500,
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects year above current year', () => {
    const result = formSchema.safeParse({
      ...validBase,
      source: {
        type: 'BOOK',
        title: 'Future Book',
        year: new Date().getFullYear() + 1,
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects tag with empty name', () => {
    const result = formSchema.safeParse({
      ...validBase,
      tags: [{ name: '' }],
    });
    expect(result.success).toBe(false);
  });
});
