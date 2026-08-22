#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';
import { getTodayCatalog, searchOffers } from './client.js';

const defaultApiBaseUrl = 'https://api.richisme.xyz';

export function createLuckMcpServer(
  apiBaseUrl = process.env.OFFER_API_BASE_URL ?? defaultApiBaseUrl,
) {
  const server = new McpServer(
    { name: 'bao-youhui', version: '1.0.0' },
    {
      instructions:
        'Use get_today_offers after the user confirms a city. Offers with null city are nationwide. Never claim fulfillment; open only returned redirectUrl values.',
    },
  );

  server.registerTool(
    'get_today_offers',
    {
      title: 'Get today coupon categories',
      description: 'Returns current verified coupon counts after the user confirms a city.',
      inputSchema: z.object({ city: z.string().min(1).max(32) }),
    },
    async ({ city }) => {
      const output = await getTodayCatalog({ apiBaseUrl, city });
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  );

  server.registerTool(
    'search_offers',
    {
      title: 'Search verified coupons',
      description: 'Returns at most five current offers with first-party attribution links.',
      inputSchema: z.object({
        city: z.string().min(1).max(32),
        category: z.string().min(1).max(64).optional(),
        keyword: z.string().min(1).max(100).optional(),
        limit: z.number().int().min(1).max(5).default(5),
        cursor: z.string().min(1).max(256).optional(),
      }),
    },
    async (input) => {
      const output = await searchOffers(
        {
          city: input.city,
          limit: input.limit,
          ...(input.category === undefined ? {} : { category: input.category }),
          ...(input.keyword === undefined ? {} : { keyword: input.keyword }),
          ...(input.cursor === undefined ? {} : { cursor: input.cursor }),
        },
        { apiBaseUrl },
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  );

  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  serveStdio(() => createLuckMcpServer());
}
