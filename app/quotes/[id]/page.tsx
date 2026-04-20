import { createCallerFactory } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';
import { ExternalLink, Play, QuoteIcon, Tag, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CopyLinkButton from '@/components/CopyLinkButton';

const createCaller = createCallerFactory(appRouter);

interface Props {
  readonly params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params;

  const caller = createCaller({ auth: { userId: null } as never });
  let quote;
  try {
    quote = await caller.getQuoteById({ id });
  } catch {
    notFound();
  }

  return (
    <div className='min-h-screen bg-muted flex items-center justify-center p-4'>
      <div className='w-full max-w-xl bg-card rounded-2xl shadow-sm p-8 space-y-6'>
        <div className='relative px-6 py-4'>
          <QuoteIcon className='absolute top-0 left-0 size-7 text-primary fill-primary opacity-15' />
          <p className='text-2xl font-serif font-medium leading-relaxed'>
            {quote.text}
          </p>
          <QuoteIcon className='absolute bottom-0 right-0 size-7 text-primary fill-primary opacity-15' />
        </div>

        {quote.author && (
          <div className='flex items-center gap-3'>
            <User className='size-4 text-muted-foreground shrink-0' />
            <span className='font-medium'>{quote.author.name}</span>
          </div>
        )}

        {quote.source && (
          <div className='bg-muted/50 rounded-xl p-4 space-y-2'>
            <span className='text-xs text-muted-foreground uppercase tracking-wide'>
              Source
            </span>
            <p className='font-medium'>{quote.source.title}</p>

            {quote.source.type === 'YOUTUBE' && (
              <>
                {quote.source.channel && (
                  <p className='text-sm text-muted-foreground'>
                    by {quote.source.channel}
                  </p>
                )}
                <div className='flex items-center gap-4 flex-wrap'>
                  {quote.source.url && (
                    <Button variant='destructive' size='sm' asChild>
                      <Link href={quote.source.url} target='_blank' rel='noopener noreferrer'>
                        <Play className='size-3' />
                        Watch on YouTube
                        <ExternalLink className='size-3' />
                      </Link>
                    </Button>
                  )}
                  {quote.source.timestamp && (
                    <span className='text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded'>
                      {quote.source.timestamp}
                    </span>
                  )}
                </div>
              </>
            )}

            {quote.source.type !== 'YOUTUBE' && quote.source.url && (
              <Button variant='outline' size='sm' asChild>
                <Link href={quote.source.url} target='_blank' rel='noopener noreferrer'>
                  View Source
                  <ExternalLink className='size-3' />
                </Link>
              </Button>
            )}
          </div>
        )}

        {quote.tags.length > 0 && (
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Tag className='size-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>Tags</span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {quote.tags.map((qt) => (
                <span
                  key={qt.tag.id}
                  className='px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium'>
                  #{qt.tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className='flex items-center justify-between pt-2 border-t border-border'>
          <Link href='/' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
            ← Back to quotes
          </Link>
          <CopyLinkButton />
        </div>
      </div>
    </div>
  );
}
