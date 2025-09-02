import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/trpc/routers/_app';

type R = inferRouterOutputs<AppRouter>;
export type Quote = R['getQuotes'][number];
