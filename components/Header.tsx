'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

import CreateQuoteModal from './CreateQuoteModal';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = new URLSearchParams(params.toString());
      if (value.trim()) q.set('search', value.trim());
      else q.delete('search');
      router.replace(`${pathname}?${q.toString()}`);
    }, 300);
  };

  return (
    <header className='bg-card h-16 px-4 border-b border-border'>
      <div className='max-w-7xl flex justify-between items-center gap-2 md:gap-4 h-full mx-auto'>
        <div className='flex items-center gap-2 md:gap-4'>
          <div className='text-2xl md:text-3xl font-black text-primary'>
            Quotes
          </div>
          <Input
            className='bg-muted border-none hidden md:block'
            placeholder='Search quotes...'
            defaultValue={params.get('search') ?? ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className='flex items-center gap-2 md:gap-4'>
          <ThemeToggle />
          <CreateQuoteModal />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
