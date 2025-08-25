import { useMemo, useState } from 'react';
import { Badge } from './ui/badge';
import { Check, Loader2, Plus, X } from 'lucide-react';
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
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface TagSelectProps {
  value: { id?: string; name: string }[];
  onChange: (next: { id?: string; name: string }[]) => void;
  createLabel?: (q: string) => string;
}

export type Tag = { id: string; name: string };

const TagSelect = ({
  value,
  onChange,
  createLabel = (q: string) => `Create ${q}`,
}: TagSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const trpc = useTRPC();
  const { data: options = [], isFetching } = useQuery(
    trpc.getTags.queryOptions()
  );

  const selectedNames = useMemo(
    () => new Set(value.map((v) => v.name.toLowerCase())),
    [value]
  );

  const existingExact = options.find(
    (o) => o.name.toLowerCase() === query.trim().toLowerCase()
  );
  const canCreate =
    query.trim().length > 0 &&
    !existingExact &&
    !selectedNames.has(query.trim().toLowerCase());

  const addTag = (tag: { id?: string; name: string }) => {
    if (selectedNames.has(tag.name.toLowerCase())) return;
    onChange([...value, tag]);
    setQuery('');
  };
  const removeTag = (name: string) => {
    onChange(value.filter((t) => t.name.toLowerCase() !== name.toLowerCase()));
  };

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap gap-2'>
        {value.map((t) => (
          <Badge key={t.name} variant='secondary' className='px-2 py-1 text-sm'>
            {t.name}
            <button
              type='button'
              onClick={() => removeTag(t.name)}
              className='ml-1 rounded-sm outline-none hover:opacity-80'
              aria-label={`Remove ${t.name}`}>
              <X className='size-3' />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-start'>
            <Plus className='mr-2 size-4' />
            Add tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0 w-[420px]' align='start'>
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder='Search tags...'
              autoFocus
            />
            <CommandList>
              {isFetching ? (
                <div className='flex items-center gap-2 p-3 text-sm opacity-70'>
                  <Loader2 className='size-4 animate-spin' /> Searching...
                </div>
              ) : (
                <>
                  <CommandEmpty>No tags found</CommandEmpty>
                  <ScrollArea className='max-h-64'>
                    <CommandGroup heading='Suggestions'>
                      {options.map((opt) => (
                        <CommandItem
                          key={opt.id}
                          onSelect={() =>
                            addTag({ id: opt.id, name: opt.name })
                          }
                          className='cursor-pointer'>
                          {opt.name}
                          <Check
                            className={cn(
                              'ml-auto',
                              selectedNames.has(opt.name.toLowerCase())
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </ScrollArea>
                  {canCreate && (
                    <>
                      <Separator className='my-1' />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => addTag({ name: query.trim() })}>
                          <Plus className='mr-2 size-4' />
                          {createLabel(query.trim())}
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagSelect;
