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

const QuoteList = () => {
  const trpc = useTRPC();
  const { data: quotes = [] } = useQuery(trpc.getQuotes.queryOptions());

  console.log(quotes);

  return (
    <div className='max-w-7xl mx-auto'>
      <Input
        className='block md:hidden mb-4 bg-white shadow-none text-sm w-full'
        placeholder='Search quotes...'
      />
      <div className='flex flex-col md:flex-row items-center justify-between gap-4 mb-4'>
        <div className='flex items-center gap-4 w-full overflow-auto'>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>All</div>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>
            Motivation
          </div>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>
            Motivation
          </div>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>
            Motivation
          </div>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>
            Motivation
          </div>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>
            Motivation
          </div>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>
            Motivation
          </div>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>
            Motivation
          </div>
          <div className='bg-white px-4 py-2 rounded-md text-sm'>
            Motivation
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <Select>
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
        {quotes.map((quote, index) => (
          <div
            key={index}
            className='relative bg-white p-6 rounded-lg hover:shadow-md cursor-pointer'>
            <Quote className='absolute top-2 left-2 fill-primary text-primary opacity-15 size-12' />
            <p className='font-serif text-lg'>{quote.text}</p>
            <p className='font-bold mt-2'>- Jim Collins</p>
            <div className='flex items-center gap-2 flex-wrap mt-4'>
              {quote.tags.map((tag, index) => (
                <div
                  key={index}
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
