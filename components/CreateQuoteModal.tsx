'use client';

import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import TagSelect from './TagSelect';
import AuthorSelect from './AuthorSelect';
import { Textarea } from './ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const formSchema = z.object({
  text: z.string().min(1, 'Quote is required'),
  author: z.string(),
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
        .optional(),
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

const CreateQuoteModal = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      author: '',
      source: {
        type: undefined,
        title: '',
        url: '',
        timestamp: '',
        channel: '',
        author: '',
        publisher: '',
        year: undefined,
        isbn: '',
      },
      tags: [],
    },
  });

  const sourceType = form.watch('source.type');

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.createQuote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.getQuotes.queryKey() });
        form.reset();
        setOpen(false);
        toast.success('Quote created');
      },
      onError: () => {
        toast.error('Failed to create quote');
      },
    })
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const existingTagIds = values.tags.filter((t) => t.id).map((t) => t.id!);
    const newTagNames = values.tags
      .filter((t) => !t.id)
      .map((t) => t.name.trim());

    createMutation.mutate({
      text: values.text.trim(),
      authorId: values.author,
      source: values.source,
      existingTagIds,
      newTagNames,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus />
          <span className='hidden md:inline'>Add Quote</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new quote</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='text'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Enter the quote' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='author'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <AuthorSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='source.type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select source type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='YOUTUBE'>Youtube</SelectItem>
                        <SelectItem value='BOOK'>Book</SelectItem>
                        <SelectItem value='ARTICLE'>Article</SelectItem>
                        <SelectItem value='PODCAST'>Podcast</SelectItem>
                        <SelectItem value='SPEECH'>Speech</SelectItem>
                        <SelectItem value='INTERVIEW'>Interview</SelectItem>
                        <SelectItem value='WEBSITE'>Website</SelectItem>
                        <SelectItem value='OTHER'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {sourceType && (
              <>
                <FormField
                  control={form.control}
                  name='source.title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter the source title'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='source.url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source URL</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter the source URL' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {sourceType === 'YOUTUBE' && (
              <>
                <FormField
                  control={form.control}
                  name='source.channel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Channel</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter the YouTube cnannel'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='source.timestamp'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timestamp</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter the timestamp' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end items-center'>
              <Button disabled={createMutation.isPending} type='submit'>
                {createMutation.isPending ? 'Saving...' : 'Save Quote'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuoteModal;
