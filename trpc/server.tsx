import 'server-only';

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { createTRPCClient, httpLink } from '@trpc/client';

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

createTRPCOptionsProxy({
  client: createTRPCClient({
    links: [httpLink({ url: '...' })],
  }),
  queryClient: getQueryClient,
});
