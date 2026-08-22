import { describe, expect, it, vi } from 'vitest';
import { run } from '../scripts/workbuddy-search.mjs';

describe('WorkBuddy bridge', () => {
  it('posts only bounded input to the configured HTTPS API', async () => {
    const fetchFn = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ offers: [], nextCursor: null }))),
    );

    await expect(
      run({
        apiBaseUrl: 'https://api.example.test',
        rawInput: '{"city":"上海","limit":5}',
        fetchFn,
      }),
    ).resolves.toEqual({ offers: [], nextCursor: null });
    expect(fetchFn).toHaveBeenCalledWith(
      new URL('https://api.example.test/v1/offers/search'),
      expect.objectContaining({ body: '{"city":"上海","limit":5}', method: 'POST' }),
    );
  });

  it.each([
    ['http://api.example.test', '{}'],
    ['https://api.example.test/path', '{}'],
    ['https://api.example.test', '{"unknown":"value"}'],
  ])('rejects unsafe configuration or input', async (apiBaseUrl, rawInput) => {
    await expect(run({ apiBaseUrl, rawInput })).rejects.toThrow(/^INVALID_/u);
  });

  it('returns a safe service error without leaking transport diagnostics', async () => {
    await expect(
      run({
        apiBaseUrl: 'https://api.example.test',
        rawInput: '{}',
        fetchFn: () => Promise.reject(new Error('sensitive diagnostic')),
      }),
    ).rejects.toThrow('SERVICE_UNAVAILABLE');
  });

  it('rejects unbounded upstream data before printing it', async () => {
    await expect(
      run({
        apiBaseUrl: 'https://api.example.test',
        rawInput: '{}',
        fetchFn: () =>
          Promise.resolve(new Response(JSON.stringify({ offers: [{ secret: true }] }))),
      }),
    ).rejects.toThrow('INVALID_RESPONSE');
  });
});
