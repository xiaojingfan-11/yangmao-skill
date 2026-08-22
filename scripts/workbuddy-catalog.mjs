import { pathToFileURL } from 'node:url';

function endpointFor(raw, city) {
  const url = new URL(raw);
  if (
    url.protocol !== 'https:' ||
    url.username !== '' ||
    url.password !== '' ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== ''
  )
    throw new Error('INVALID_CONFIGURATION');
  url.pathname = '/v1/offers/today';
  if (city !== undefined) url.searchParams.set('city', city);
  return url;
}

export async function run({ apiBaseUrl, rawInput, fetchFn = globalThis.fetch }) {
  let input;
  try {
    input = JSON.parse(rawInput);
  } catch {
    throw new Error('INVALID_INPUT');
  }
  if (
    input === null ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some((key) => key !== 'city') ||
    (input.city !== undefined &&
      (typeof input.city !== 'string' || input.city.length < 1 || input.city.length > 32))
  )
    throw new Error('INVALID_INPUT');
  let response;
  try {
    response = await fetchFn(endpointFor(apiBaseUrl, input.city), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new Error('SERVICE_UNAVAILABLE');
  }
  if (!response.ok) throw new Error('SERVICE_UNAVAILABLE');
  const payload = await response.json().catch(() => {
    throw new Error('INVALID_RESPONSE');
  });
  if (
    payload === null ||
    typeof payload !== 'object' ||
    !Number.isInteger(payload.total) ||
    payload.total < 0 ||
    !Array.isArray(payload.categories) ||
    !payload.categories.every(
      (item) =>
        item &&
        typeof item.code === 'string' &&
        typeof item.label === 'string' &&
        typeof item.emoji === 'string' &&
        Number.isInteger(item.count) &&
        item.count >= 0,
    ) ||
    !Array.isArray(payload.activities) ||
    !payload.activities.every(
      (item) =>
        item &&
        typeof item.title === 'string' &&
        typeof item.summary === 'string' &&
        typeof item.category === 'string' &&
        (item.city === null || typeof item.city === 'string') &&
        (item.validUntil === null || typeof item.validUntil === 'string') &&
        typeof item.detailUrl === 'string' &&
        /^https:\/\/go\.richisme\.xyz\/o\//u.test(item.detailUrl),
    )
  )
    throw new Error('INVALID_RESPONSE');
  for (const [key, limit] of [
    ['platformCoupons', 10],
    ['brandDiscounts', 6],
    ['membershipsAndMore', 4],
  ]) {
    if (
      !Array.isArray(payload[key]) ||
      payload[key].length > limit ||
      !payload[key].every(
        (item) =>
          item &&
          typeof item.title === 'string' &&
          typeof item.summary === 'string' &&
          typeof item.valueText === 'string' &&
          (item.city === null || typeof item.city === 'string') &&
          (item.validUntil === null || typeof item.validUntil === 'string') &&
          typeof item.detailUrl === 'string' &&
          /^https:\/\/go\.richisme\.xyz\/o\//u.test(item.detailUrl),
      )
    )
      throw new Error('INVALID_RESPONSE');
  }
  return payload;
}

async function main() {
  try {
    const result = await run({
      apiBaseUrl: process.env.OFFER_API_BASE_URL ?? 'https://api.richisme.xyz',
      rawInput: process.argv[2] ?? '{}',
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({ error: error instanceof Error ? error.message : 'SERVICE_UNAVAILABLE' })}\n`,
    );
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
