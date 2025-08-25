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
import { LayoutGrid, Quote } from 'lucide-react';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  const { data: quotes = [] } = useQuery(
    trpc.getQuotes.queryOptions({
      tag,
      sort,
    })
  );
  const { data: tags = [] } = useQuery(trpc.getTags.queryOptions());

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
            className='bg-primary text-white hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm cursor-pointer transition duration-300'>
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setTag(tag.name)}
              className='bg-white hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm cursor-pointer transition duration-300'>
              {tag.name}
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
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className='relative bg-white p-6 rounded-lg hover:shadow-md cursor-pointer'>
            <Quote className='absolute top-2 left-2 fill-primary text-primary opacity-15 size-12' />
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
        ))}
      </div>
    </div>
  );
};

export default QuoteList;
