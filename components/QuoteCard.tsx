import { Quote } from '@/types/quote';
import { ExternalLink, Play, QuoteIcon, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import Link from 'next/link';

interface QuoteCardProps {
  quote: Quote;
}

const QuoteCard = ({ quote }: QuoteCardProps) => {
  return (
    <Dialog>
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
          <DialogTitle>Quote details</DialogTitle>
        </DialogHeader>
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
                        <Link
                          href={quote.source.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors'>
                          <Play className='size-4' />
                          Watch on YouTube
                          <ExternalLink className='size-3' />
                        </Link>
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
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteCard;
