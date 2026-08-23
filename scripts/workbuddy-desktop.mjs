import { pathToFileURL } from 'node:url';

function endpointFor(raw, city) {
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/')
    throw new Error('INVALID_CONFIGURATION');
  url.pathname = '/v1/offers/desktop';
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
    typeof payload.renderedText !== 'string' ||
    !Array.isArray(payload.sections) ||
    !payload.sections.every(
      (section) =>
        section &&
        typeof section.code === 'string' &&
        typeof section.label === 'string' &&
        Array.isArray(section.items) &&
        section.items.length <= 5,
    )
  )
    throw new Error('INVALID_RESPONSE');
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
