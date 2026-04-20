import { Suspense } from 'react';

import Header from '@/components/Header';
import QuoteList from '@/components/QuoteList';

export default function Home() {
  return (
    <div className='min-h-screen bg-muted'>
      <Suspense>
        <Header />
      </Suspense>
      <main className='p-4 md:p-6'>
        <Suspense>
          <QuoteList />
        </Suspense>
      </main>
    </div>
  );
}
