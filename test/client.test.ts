import { describe, expect, it, vi } from 'vitest';
import { getTodayCatalog, OfferClientError, searchOffers } from '../src/client.js';

const validResponse = {
  offers: [
    {
      id: 'public-offer-1',
      title: 'Verified offer title',
      summary: 'Verified summary',
      category: 'food.coffee',
      city: '530100',
      currency: 'CNY',
      salePriceMinor: 1990,
      originalPriceMinor: 2990,
      validUntil: '2026-08-21T00:00:00.000Z',
      redirectUrl: 'https://go.example.invalid/r/token',
      sourceLabel: 'Partner platform',
      disclaimer: 'Final price and availability are determined by the destination page.',
    },
  ],
  nextCursor: null,
};

describe('searchOffers', () => {
  it('posts only bounded public fields to configured API base URL', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify(validResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const response = await searchOffers(
      { keyword: 'coffee', city: '530100', limit: 5 },
      { apiBaseUrl: 'https://api.example.invalid', fetch },
    );
    expect(response).toEqual(validResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.invalid/v1/offers/search',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ keyword: 'coffee', city: '530100', limit: 5 }),
      }),
    );
  });

  it('rejects an insecure API origin before making a request', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    await expect(
      searchOffers({ keyword: 'coffee' }, { apiBaseUrl: 'http://api.example.invalid', fetch }),
    ).rejects.toMatchObject({ code: 'INVALID_CONFIGURATION' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    'https://user:password@api.example.invalid',
    'https://api.example.invalid?target=other',
    'https://api.example.invalid#fragment',
  ])('rejects unsafe API base URL %s', async (apiBaseUrl) => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    await expect(searchOffers({}, { apiBaseUrl, fetch })).rejects.toMatchObject({
      code: 'INVALID_CONFIGURATION',
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('aborts a stalled request after the configured bounded timeout', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn<typeof globalThis.fetch>(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), {
            once: true,
          });
        }),
    );
    const pending = searchOffers(
      { keyword: 'coffee' },
      { apiBaseUrl: 'https://api.example.invalid', fetch, timeoutMs: 1_000 },
    );
    const assertion = expect(pending).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    await vi.advanceTimersByTimeAsync(1_000);

    await assertion;
    vi.useRealTimers();
  });

  it.each([0, 30_001])('rejects out-of-range timeout %s', async (timeoutMs) => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    await expect(
      searchOffers({}, { apiBaseUrl: 'https://api.example.invalid', fetch, timeoutMs }),
    ).rejects.toMatchObject({ code: 'INVALID_CONFIGURATION' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects more than five requested results', async () => {
    await expect(
      searchOffers({ keyword: 'coffee', limit: 6 }, { apiBaseUrl: 'https://api.example.invalid' }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('maps non-success responses to a stable safe error', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response('private failure', { status: 503 }));
    await expect(
      searchOffers({ keyword: 'coffee' }, { apiBaseUrl: 'https://api.example.invalid', fetch }),
    ).rejects.toEqual(new OfferClientError('SERVICE_UNAVAILABLE', 'Offer service is unavailable'));
  });

  it('rejects malformed API data rather than displaying it', async () => {
    const malformed = { ...validResponse, offers: [{ title: 'missing required fields' }] };
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify(malformed), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(
      searchOffers({ keyword: 'coffee' }, { apiBaseUrl: 'https://api.example.invalid', fetch }),
    ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
});

describe('getTodayCatalog', () => {
  it('gets the navigation catalog with an optional city', async () => {
    const payload = {
      asOf: '2026-08-21T12:00:00.000Z',
      city: '530100',
      total: 49,
      categories: [{ code: 'delivery', label: '外卖闪购', emoji: '🛵', count: 49 }],
      activities: [
        {
          title: '外卖红包',
          summary: '天天领',
          category: 'delivery',
          city: null,
          validUntil: null,
          detailUrl: 'https://luck.richisme.xyz/?search=%E5%A4%96%E5%8D%96',
        },
      ],
      promotions: [],
      coupons: [],
      platformCoupons: [],
      brandDiscounts: [],
      membershipsAndMore: [],
    };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    await expect(
      getTodayCatalog({ apiBaseUrl: 'https://api.example.invalid', city: '530100', fetch }),
    ).resolves.toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.invalid/v1/offers/today?city=530100',
      expect.objectContaining({ headers: { accept: 'application/json' } }),
    );
  });

  it('rejects malformed catalog data', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ total: -1, categories: [] }), { status: 200 }),
      );
    await expect(
      getTodayCatalog({ apiBaseUrl: 'https://api.example.invalid', fetch }),
    ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
});
