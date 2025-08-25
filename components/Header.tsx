import { SignedIn, UserButton } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';

import CreateQuoteModal from './CreateQuoteModal';

const Header = () => {
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
