import { pathToFileURL } from 'node:url';

const ALLOWED_KEYS = new Set([
  'keyword',
  'city',
  'category',
  'brand',
  'budgetMinor',
  'date',
  'people',
  'limit',
  'cursor',
]);

const OFFER_KEYS = new Set([
  'id',
  'title',
  'summary',
  'category',
  'city',
  'currency',
  'salePriceMinor',
  'originalPriceMinor',
  'validUntil',
  'redirectUrl',
  'sourceLabel',
  'disclaimer',
]);

const plainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const boundedString = (value, minimum, maximum) =>
  typeof value === 'string' && value.length >= minimum && value.length <= maximum;
const nullableInteger = (value) => value === null || (Number.isSafeInteger(value) && value >= 0);

function safeHttpsUrl(value) {
  if (!boundedString(value, 1, 2048)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function validInput(input) {
  if (!plainObject(input) || Object.keys(input).some((key) => !ALLOWED_KEYS.has(key))) return false;
  const stringLimits = { keyword: 100, city: 32, category: 64, brand: 64, cursor: 256 };
  for (const [key, maximum] of Object.entries(stringLimits)) {
    if (input[key] !== undefined && !boundedString(input[key], 1, maximum)) return false;
  }
  if (input.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/u.test(input.date)) return false;
  if (
    input.budgetMinor !== undefined &&
    (!Number.isSafeInteger(input.budgetMinor) ||
      input.budgetMinor < 0 ||
      input.budgetMinor > 100_000_000)
  ) {
    return false;
  }
  if (
    input.people !== undefined &&
    (!Number.isSafeInteger(input.people) || input.people < 1 || input.people > 100)
  )
    return false;
  return (
    input.limit === undefined ||
    (Number.isSafeInteger(input.limit) && input.limit >= 1 && input.limit <= 5)
  );
}

function validOffer(offer) {
  if (!plainObject(offer) || Object.keys(offer).some((key) => !OFFER_KEYS.has(key))) return false;
  return (
    Object.keys(offer).length === OFFER_KEYS.size &&
    boundedString(offer.id, 1, 128) &&
    boundedString(offer.title, 1, 200) &&
    boundedString(offer.summary, 0, 1000) &&
    boundedString(offer.category, 1, 64) &&
    (offer.city === null || boundedString(offer.city, 0, 32)) &&
    offer.currency === 'CNY' &&
    nullableInteger(offer.salePriceMinor) &&
    nullableInteger(offer.originalPriceMinor) &&
    (offer.validUntil === null ||
      (typeof offer.validUntil === 'string' &&
        offer.validUntil.endsWith('Z') &&
        Number.isFinite(Date.parse(offer.validUntil)))) &&
    safeHttpsUrl(offer.redirectUrl) &&
    boundedString(offer.sourceLabel, 1, 100) &&
    boundedString(offer.disclaimer, 1, 300)
  );
}

function validResponse(payload) {
  return (
    plainObject(payload) &&
    Object.keys(payload).length === 2 &&
    Object.hasOwn(payload, 'offers') &&
    Object.hasOwn(payload, 'nextCursor') &&
    Array.isArray(payload.offers) &&
    payload.offers.length <= 5 &&
    payload.offers.every(validOffer) &&
    (payload.nextCursor === null || boundedString(payload.nextCursor, 0, 256))
  );
}

function endpointFor(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('INVALID_CONFIGURATION');
  }
  if (
    url.protocol !== 'https:' ||
    url.username !== '' ||
    url.password !== '' ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== ''
  ) {
    throw new Error('INVALID_CONFIGURATION');
  }
  url.pathname = '/v1/offers/search';
  return url;
}

function parseInput(raw) {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    throw new Error('INVALID_INPUT');
  }
  if (!validInput(input)) throw new Error('INVALID_INPUT');
  return input;
}

export async function run({ apiBaseUrl, fetchFn = globalThis.fetch, rawInput }) {
  const endpoint = endpointFor(apiBaseUrl);
  const input = parseInput(rawInput);
  const signal = AbortSignal.timeout(8_000);
  let response;
  try {
    response = await fetchFn(endpoint, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    });
  } catch {
    throw new Error('SERVICE_UNAVAILABLE');
  }
  if (!response.ok) throw new Error('SERVICE_UNAVAILABLE');
  const payload = await response.json().catch(() => {
    throw new Error('INVALID_RESPONSE');
  });
  if (!validResponse(payload)) throw new Error('INVALID_RESPONSE');
  return payload;
}

async function main() {
  try {
    const payload = await run({
      apiBaseUrl: process.env.OFFER_API_BASE_URL,
      rawInput: process.argv[2] ?? '',
    });
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'SERVICE_UNAVAILABLE';
    process.stdout.write(`${JSON.stringify({ error: code })}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
