import { z } from 'zod';

export const formSchema = z.object({
  text: z.string().min(1, 'Quote is required'),
  author: z.string(),
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
    .optional(),
  tags: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
      })
    )
    .min(1, 'Please add at least one tag'),
});
