'use client';

import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import TagSelect from './TagSelect';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

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
});

const Header = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      author: '',
      tags: [],
    },
  });

  const trpc = useTRPC();
  const greeting = useQuery(trpc.hello.queryOptions({ text: 'world' }));

  if (!greeting.data) return <div>Loading...</div>;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <header className='bg-white h-16 px-4'>
      <div className='max-w-7xl flex justify-between items-center gap-2 md:gap-4 h-full mx-auto'>
        <div className='flex items-center gap-2 md:gap-4'>
          <div className='text-2xl md:text-3xl font-black text-primary'>
            Quotes
          </div>
          <Input
            className='bg-neutral-100 border-none hidden md:block'
            placeholder='Search quotes...'
          />
        </div>
        <div className='flex items-center gap-2 md:gap-4'>
          <Dialog>
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
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='text'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter the quote' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='author'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter the quote' {...field} />
                        </FormControl>
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
                          <TagSelect
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
