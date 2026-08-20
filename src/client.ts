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
}

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
  url.pathname = `${url.pathname.replace(/\/$/, '')}/v1/offers/search`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

export async function searchOffers(
  input: OfferSearchInput,
  options: SearchOptions,
): Promise<OfferSearchResponse> {
  const endpoint = endpointFor(options.apiBaseUrl);
  if (!Value.Check(OfferSearchInputSchema, input)) {
    throw new OfferClientError('INVALID_INPUT', 'Offer search input is invalid');
  }

  let response: Response;
  try {
    response = await (options.fetch ?? globalThis.fetch)(endpoint, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(input),
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
  } catch {
    throw new OfferClientError('SERVICE_UNAVAILABLE', 'Offer service is unavailable');
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
