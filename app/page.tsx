import Header from '@/components/Header';
import QuoteList from '@/components/QuoteList';

export default function Home() {
  return (
    <div className='min-h-screen bg-muted'>
      <Header />
      <main className='p-4 md:p-6'>
        <QuoteList />
      </main>
    </div>
  );
}
