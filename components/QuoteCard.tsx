import { Quote } from '@/types/quote';
import {
  ExternalLink,
  Pencil,
  Play,
  QuoteIcon,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import Link from 'next/link';
import { Button } from './ui/button';
import { useMemo, useState } from 'react';
import QuoteForm from './QuoteForm';
import { z } from 'zod';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { formSchema } from '@/lib/schemas/quote';

interface QuoteCardProps {
  quote: Quote;
}

const QuoteCard = ({ quote }: QuoteCardProps) => {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    trpc.updateQuote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.getQuotes.queryKey(),
        });
        setEditing(false);
        toast.success('Quote updated');
      },
      onError: () => {
        toast.error('Failed to update quote');
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.deleteQuote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.getQuotes.queryKey() });
        setOpen(false);
        toast.success('Quote deleted');
      },
      onError: () => {
        toast.error('Failed to delete quote');
      },
    })
  );

  const defaults = useMemo<z.infer<typeof formSchema>>(
    () => ({
      text: quote.text ?? '',
      author: quote.author?.id ?? '',
      source: {
        type: quote.source?.type ?? 'OTHER',
        title: quote.source?.title ?? '',
        url: quote.source?.url ?? '',
        timestamp: quote.source?.timestamp ?? '',
        channel: quote.source?.channel ?? '',
        author: quote.source?.author ?? '',
        publisher: quote.source?.publisher ?? '',
        year: quote.source?.year ?? undefined,
        isbn: quote.source?.isbn ?? '',
      },
      tags: quote.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    }),
    [quote]
  );

  const handleUpdate = (values: z.infer<typeof formSchema>) => {
    const existingTagIds = values.tags.filter((t) => t.id).map((t) => t.id!);
    const newTagNames = values.tags
      .filter((t) => !t.id)
      .map((t) => t.name.trim());

    updateMutation.mutate({
      id: quote.id,
      text: values.text.trim(),
      authorId: values.author,
      source: values.source,
      existingTagIds,
      newTagNames,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: quote.id });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setEditing(false);
      }}>
      <DialogTrigger asChild>
        <div
          key={quote.id}
          className='relative bg-white p-6 rounded-lg hover:shadow-md cursor-pointer'>
          <QuoteIcon className='absolute top-2 left-2 fill-primary text-primary opacity-15 size-12' />
          <p className='font-serif text-lg'>{quote.text}</p>
          <p className='font-bold mt-2'>- {quote.author?.name}</p>
          <div className='flex items-center gap-2 flex-wrap mt-4'>
            {quote.tags.map((tag) => (
              <div
                key={tag.tag.id}
                className='bg-primary/10 px-2 py-1 text-xs rounded-md text-primary'>
                {tag.tag.name}
              </div>
            ))}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit quote' : 'Quote details'}
            {!editing && (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  className='ml-2'
                  onClick={() => setEditing(true)}>
                  <Pencil className='size-4' />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive' size='sm' className='ml-2'>
                      <Trash2 />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This quote will be
                        permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleteMutation.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending
                          ? 'Deleting...'
                          : 'Confirm Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        {editing ? (
          <QuoteForm
            mode='edit'
            defaultValues={defaults}
            onSubmit={handleUpdate}
          />
        ) : (
          <div className='space-y-6'>
            <p className='relative text-xl font-serif font-medium p-6'>
              <QuoteIcon className='absolute top-0 left-0 size-6 text-primary fill-primary opacity-15' />
              {quote.text}
              <QuoteIcon className='absolute bottom-0 right-0 size-6 text-primary fill-primary opacity-15' />
            </p>
            <div className='flex items-center gap-4'>
              <User className='size-5 text-muted-foreground' />
              <div>
                <span className='text-sm text-muted-foreground'>Author</span>
                <p className='font-medium text-neutral-900'>
                  {quote.author?.name}
                </p>
              </div>
            </div>

            <div className='bg-neutral-50 rounded-xl p-4'>
              <div className='flex items-start gap-3'>
                <div className='flex-1'>
                  <span className='text-neutral-600 text-sm block mb-1'>
                    Source
                  </span>
                  <h3 className='font-medium text-neutral-900 mb-2'>
                    {quote.source?.title}
                  </h3>

                  {quote.source?.type === 'YOUTUBE' && (
                    <>
                      {quote.source.channel && (
                        <p className='text-sm text-neutral-600 mb-2'>
                          by {quote.source.channel}
                        </p>
                      )}
                      <div className='flex items-center gap-4'>
                        {quote.source.url && (
                          <Button variant='destructive' asChild>
                            <Link
                              href={quote.source.url}
                              target='_blank'
                              rel='noopener noreferrer'>
                              <Play className='size-4' />
                              Watch on YouTube
                              <ExternalLink className='size-3' />
                            </Link>
                          </Button>
                        )}
                        {quote.source.timestamp && (
                          <div className='flex items-center gap-1 text-sm text-neutral-600'>
                            <span>Timestamp: </span>
                            <span className='font-mono bg-neutral-200 px-2 py-1 rounded'>
                              {quote.source.timestamp}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {quote.source?.type !== 'YOUTUBE' && quote.source?.url && (
                    <Button variant='destructive' asChild>
                      <Link
                        href={quote.source.url}
                        target='_blank'
                        rel='noopener noreferrer'>
                        View Source
                        <ExternalLink className='size-3' />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Tag className='size-5 text-neutral-500' />
                <span className='text-neutral-600 text-sm'>Tags</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {quote.tags.map((quoteTag) => (
                  <span
                    key={quoteTag.tag.id}
                    className='px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 cursor-pointer transition-colors'>
                    #{quoteTag.tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuoteCard;
