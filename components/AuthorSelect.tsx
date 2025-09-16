import React, { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

interface AuthorSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const AuthorSelect = ({ value, onChange }: AuthorSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: authors = [] } = useQuery(trpc.getAuthors.queryOptions());

  const normalizedQuery = query.trim().toLowerCase();
  const hasExact = useMemo(
    () =>
      normalizedQuery.length > 0 &&
      authors.some((a) => a.name.trim().toLowerCase() === normalizedQuery),
    [authors, normalizedQuery]
  );

  const filtered = useMemo(
    () =>
      normalizedQuery
        ? authors.filter((a) => a.name.toLowerCase().includes(normalizedQuery))
        : authors,
    [authors, normalizedQuery]
  );

  const selectAuthor = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  const handleCreate = () => {
    if (!normalizedQuery || hasExact || createAuthor.isPending) return;

    createAuthor.mutate({
      name: query,
    });
  };

  const createAuthor = useMutation(
    trpc.createAuthor.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.getAuthors.queryKey(),
        });
        selectAuthor(data.id);
      },
      onError: (error) => console.error(error),
    })
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='justify-between'>
          {value
            ? authors.find((author) => author.id === value)?.name
            : 'Select authors...'}
          <ChevronsUpDown className='size-4 text-muted-foreground' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder='Search authors...'
          />
          <CommandList>
            <CommandEmpty>No authors found.</CommandEmpty>
            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map((author) => (
                  <CommandItem
                    key={author.id}
                    value={author.id}
                    onSelect={selectAuthor}>
                    {author.name}
                    <Check
                      className={cn(
                        'ml-auto',
                        author.id === value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {query.trim().length > 0 && !hasExact && (
              <CommandGroup>
                <CommandItem onSelect={handleCreate}>
                  {createAuthor.isPending ? (
                    <>
                      <Loader2 className='mr-2 size-4 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className='mr-2 size-4' />
                      Create &quot;{query.trim()}&quot;
                    </>
                  )}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AuthorSelect;
