'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LayoutGrid } from 'lucide-react';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import QuoteCard from './QuoteCard';

type Sort = 'newest' | 'oldest';

const QuoteList = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const tag = params.get('tag') || undefined;
  const sortParam = params.get('sort') || undefined;

  const sort: Sort | undefined =
    sortParam === 'newest' || sortParam === 'oldest' ? sortParam : undefined;

  const trpc = useTRPC();
  const { data: quotes = [], isFetching: isQuotesFetching } = useQuery(
    trpc.getQuotes.queryOptions({
      tag,
      sort,
    })
  );
  const { data: tags = [], isFetching: isTagsFetching } = useQuery(
    trpc.getTags.queryOptions()
  );

  const setTag = (tagName?: string) => {
    const q = new URLSearchParams(params.toString());
    if (tagName) q.set('tag', tagName);
    else q.delete('tag');
    router.replace(`${pathname}?${q.toString()}`);
  };

  return (
    <div className='max-w-7xl mx-auto'>
      <Input
        className='block md:hidden mb-4 bg-white shadow-none text-sm w-full'
        placeholder='Search quotes...'
      />
      <div className='flex flex-col md:flex-row items-center justify-between gap-4 mb-4'>
        <div className='flex items-center gap-4 w-full overflow-auto'>
          <button
            onClick={() => setTag(undefined)}
            className={cn(
              'bg-white hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm cursor-pointer transition duration-300',
              !tag && 'bg-primary text-white'
            )}>
            All
          </button>
          {isTagsFetching
            ? Array.from({ length: 6 }).map((_, i) => <TagSkeleton key={i} />)
            : tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTag(t.name)}
                  className={cn(
                    'bg-white hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm cursor-pointer transition duration-300',
                    t.name === tag && 'bg-primary text-white'
                  )}>
                  {t.name}
                </button>
              ))}
        </div>
        <div className='flex items-center gap-4'>
          <Select
            value={sort}
            onValueChange={(value) => {
              const query = new URLSearchParams(params.toString());
              query.set('sort', value);
              window.location.search = query.toString();
            }}>
            <SelectTrigger className='bg-white border-none outline-none shadow-none'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
                <SelectItem value='newest'>Newest</SelectItem>
                <SelectItem value='oldest'>Oldest</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant='outline' className='border-none'>
            <LayoutGrid className='size-4' />
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {isQuotesFetching
          ? Array.from({ length: 9 }).map((_, i) => <QuoteSkeleton key={i} />)
          : quotes.map((quote) => <QuoteCard key={quote.id} quote={quote} />)}
      </div>
    </div>
  );
};

const TagSkeleton = () => {
  return <Skeleton className='h-9 w-16 bg-neutral-200' />;
};

const QuoteSkeleton = () => {
  return <Skeleton className='h-32 w-full bg-neutral-200' />;
};

export default QuoteList;
