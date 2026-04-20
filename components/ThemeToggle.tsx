'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label='Toggle theme'>
      <Sun className='size-4 dark:hidden' />
      <Moon className='size-4 hidden dark:block' />
    </Button>
  );
};

export default ThemeToggle;
