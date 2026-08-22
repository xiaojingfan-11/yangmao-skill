import { searchOffers } from '../dist/index.js';

const apiBaseUrl = process.env.OFFER_API_BASE_URL;
const expectedRedirectOrigin = process.env.EXPECTED_REDIRECT_ORIGIN;
if (apiBaseUrl === undefined || expectedRedirectOrigin === undefined) {
  throw new Error('OFFER_API_BASE_URL and EXPECTED_REDIRECT_ORIGIN are required');
}

const expectedOrigin = new URL(expectedRedirectOrigin).origin;
const result = await searchOffers({ limit: 1 }, { apiBaseUrl });
const redirectOrigins = result.offers.map(({ redirectUrl }) => new URL(redirectUrl).origin);
if (!redirectOrigins.every((origin) => origin === expectedOrigin)) {
  throw new Error('Offer response contained an unexpected redirect origin');
}

process.stdout.write(
  `${JSON.stringify({
    status: 'ok',
    offerCount: result.offers.length,
    hasNextPage: result.nextCursor !== null,
    redirectOriginVerified: true,
  })}\n`,
);
