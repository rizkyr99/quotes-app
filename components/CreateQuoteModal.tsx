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
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';

const formSchema = z.object({
  text: z.string().min(1, 'Quote is required'),
  author: z.string(),
  tags: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
      })
    )
    .min(1, 'Please add at least one tag'),
  source: z.string().optional(),
});

const CreateQuoteModal = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      author: '',
      tags: [],
      source: '',
    },
  });

  const trpc = useTRPC();

  const createMutation = useMutation(
    trpc.createQuote.mutationOptions({
      onSuccess: () => {
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
              name='source'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input placeholder='Source' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
