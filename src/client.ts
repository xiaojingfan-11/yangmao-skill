import { Value } from '@sinclair/typebox/value';
import {
  OfferSearchInputSchema,
  OfferSearchResponseSchema,
  type OfferSearchInput,
  type OfferSearchResponse,
} from './schema.js';

export type OfferClientErrorCode =
  'INVALID_CONFIGURATION' | 'INVALID_INPUT' | 'SERVICE_UNAVAILABLE' | 'INVALID_RESPONSE';

export class OfferClientError extends Error {
  readonly code: OfferClientErrorCode;

  constructor(code: OfferClientErrorCode, message: string) {
    super(message);
    this.name = 'OfferClientError';
    this.code = code;
  }
}

export interface SearchOptions {
  apiBaseUrl: string;
  fetch?: typeof globalThis.fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8_000;
const MAX_TIMEOUT_MS = 30_000;

function endpointFor(baseUrl: string): string {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new OfferClientError('INVALID_CONFIGURATION', 'API base URL is invalid');
  }
  if (url.protocol !== 'https:') {
    throw new OfferClientError('INVALID_CONFIGURATION', 'API base URL must use HTTPS');
  }
  if (url.username !== '' || url.password !== '' || url.search !== '' || url.hash !== '') {
    throw new OfferClientError('INVALID_CONFIGURATION', 'API base URL is unsafe');
  }
  url.pathname = `${url.pathname.replace(/\/$/, '')}/v1/offers/search`;
  return url.toString();
}

export async function searchOffers(
  input: OfferSearchInput,
  options: SearchOptions,
): Promise<OfferSearchResponse> {
  const endpoint = endpointFor(options.apiBaseUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_TIMEOUT_MS) {
    throw new OfferClientError('INVALID_CONFIGURATION', 'Request timeout is invalid');
  }
  if (!Value.Check(OfferSearchInputSchema, input)) {
    throw new OfferClientError('INVALID_INPUT', 'Offer search input is invalid');
  }

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);
  const signal =
    options.signal === undefined
      ? timeoutController.signal
      : AbortSignal.any([options.signal, timeoutController.signal]);
  let response: Response;
  try {
    response = await (options.fetch ?? globalThis.fetch)(endpoint, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    });
  } catch {
    throw new OfferClientError('SERVICE_UNAVAILABLE', 'Offer service is unavailable');
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    throw new OfferClientError('SERVICE_UNAVAILABLE', 'Offer service is unavailable');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new OfferClientError('INVALID_RESPONSE', 'Offer service returned invalid data');
  }
  if (!Value.Check(OfferSearchResponseSchema, payload)) {
    throw new OfferClientError('INVALID_RESPONSE', 'Offer service returned invalid data');
  }
  return payload;
}
