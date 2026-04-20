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
import { BookOpen, LayoutGrid, List, SearchX } from 'lucide-react';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import type { Quote } from '@/types/quote';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

type Layout = 'grid' | 'list';
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
  const search = params.get('search') || undefined;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [layout, setLayout] = useState<Layout>('grid');

  const sort: Sort | undefined =
    sortParam === 'newest' || sortParam === 'oldest' ? sortParam : undefined;

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = new URLSearchParams(params.toString());
      if (value.trim()) q.set('search', value.trim());
      else q.delete('search');
      router.replace(`${pathname}?${q.toString()}`);
    }, 300);
  };

  const trpc = useTRPC();
  const { data: quotes = [], isLoading: isQuotesLoading } = useQuery(
    trpc.getQuotes.queryOptions({
      tag,
      sort,
      search,
    })
  );
  const { data: tags = [], isLoading: isTagsFetching } = useQuery(
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
        className='block md:hidden mb-4 bg-card shadow-none text-sm w-full'
        placeholder='Search quotes...'
        defaultValue={search ?? ''}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className='flex flex-col md:flex-row items-center justify-between gap-4 mb-4'>
        <div className='flex items-center gap-4 w-full overflow-auto'>
          <button
            onClick={() => setTag(undefined)}
            className={cn(
              'bg-card hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-md text-sm cursor-pointer transition duration-300',
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
                    'bg-card hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-md text-sm cursor-pointer transition duration-300',
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
            <SelectTrigger className='bg-card border-none outline-none shadow-none'>
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
          <Button
            variant='outline'
            size='icon'
            className='border-none'
            onClick={() => setLayout((l) => (l === 'grid' ? 'list' : 'grid'))}
            aria-label='Toggle layout'>
            {layout === 'grid' ? (
              <List className='size-4' />
            ) : (
              <LayoutGrid className='size-4' />
            )}
          </Button>
        </div>
      </div>
      <div className={cn('gap-4', layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col')}>
        {renderContent({ isQuotesLoading, quotes, search, tag, layout, onClear: () => { setTag(); router.replace(pathname); } })}
      </div>
    </div>
  );
};

interface RenderContentProps {
  isQuotesLoading: boolean;
  quotes: Quote[];
  search: string | undefined;
  tag: string | undefined;
  layout: Layout;
  onClear: () => void;
}

const renderContent = ({ isQuotesLoading, quotes, search, tag, layout, onClear }: RenderContentProps) => {
  if (isQuotesLoading) {
    return Array.from({ length: 9 }).map((_, i) => <QuoteSkeleton key={i} />);
  }
  if (quotes.length > 0) {
    return quotes.map((quote) => <QuoteCard key={quote.id} quote={quote} layout={layout} />);
  }
  if (search || tag) {
    return <NoResults search={search} tag={tag} onClear={onClear} />;
  }
  return <EmptyState />;
};

const EmptyState = () => (
  <div className='col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center'>
    <BookOpen className='size-12 text-muted-foreground opacity-40' />
    <div>
      <p className='font-semibold text-lg'>No quotes yet</p>
      <p className='text-muted-foreground text-sm mt-1'>
        Save your first quote using the button in the top right.
      </p>
    </div>
  </div>
);

interface NoResultsProps {
  search: string | undefined;
  tag: string | undefined;
  onClear: () => void;
}

const NoResults = ({ search, tag, onClear }: NoResultsProps) => (
  <div className='col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center'>
    <SearchX className='size-12 text-muted-foreground opacity-40' />
    <div>
      <p className='font-semibold text-lg'>No quotes found</p>
      <p className='text-muted-foreground text-sm mt-1'>
        {search && tag
          ? `No results for "${search}" in #${tag}`
          : search
          ? `No results for "${search}"`
          : `No quotes tagged #${tag}`}
      </p>
    </div>
    <button
      onClick={onClear}
      className='text-sm text-primary underline underline-offset-4 hover:opacity-80 transition-opacity'>
      Clear filters
    </button>
  </div>
);

const TagSkeleton = () => {
  return <Skeleton className='h-9 w-16 bg-muted' />;
};

const QuoteSkeleton = () => {
  return <Skeleton className='h-32 w-full bg-muted' />;
};

export default QuoteList;
