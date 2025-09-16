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

import { z } from 'zod';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';
import QuoteForm from './QuoteForm';
import { formSchema } from '@/lib/schemas/quote';

const CreateQuoteModal = () => {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.createQuote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.getQuotes.queryKey() });
        setOpen(false);
        toast.success('Quote created');
      },
      onError: () => {
        toast.error('Failed to create quote');
      },
    })
  );

  const defaults: z.infer<typeof formSchema> = {
    text: '',
    author: '',
    source: {
      type: 'OTHER',
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
  };

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
        <QuoteForm
          mode='create'
          defaultValues={defaults}
          onSubmit={onSubmit}
          submitting={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuoteModal;
