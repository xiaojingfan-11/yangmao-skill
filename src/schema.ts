import { FormatRegistry, Type, type Static } from '@sinclair/typebox';

FormatRegistry.Set('date', (value) => /^\d{4}-\d{2}-\d{2}$/u.test(value));
FormatRegistry.Set('date-time', (value) => {
  const parsed = Date.parse(value);
  return value.endsWith('Z') && Number.isFinite(parsed);
});
FormatRegistry.Set('uri', (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
});

export const OfferSearchInputSchema = Type.Object(
  {
    keyword: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    city: Type.Optional(Type.String({ minLength: 1, maxLength: 32 })),
    category: Type.Optional(Type.String({ minLength: 1, maxLength: 64 })),
    brand: Type.Optional(Type.String({ minLength: 1, maxLength: 64 })),
    budgetMinor: Type.Optional(Type.Integer({ minimum: 0, maximum: 100_000_000 })),
    date: Type.Optional(Type.String({ format: 'date' })),
    people: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 5 })),
    cursor: Type.Optional(Type.String({ minLength: 1, maxLength: 256 })),
  },
  { additionalProperties: false },
);

export const PublicOfferSchema = Type.Object(
  {
    id: Type.String({ minLength: 1, maxLength: 128 }),
    title: Type.String({ minLength: 1, maxLength: 200 }),
    summary: Type.String({ maxLength: 1000 }),
    category: Type.String({ minLength: 1, maxLength: 64 }),
    city: Type.Union([Type.String({ maxLength: 32 }), Type.Null()]),
    currency: Type.Literal('CNY'),
    salePriceMinor: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    originalPriceMinor: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    validUntil: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    redirectUrl: Type.String({ format: 'uri', maxLength: 2048 }),
    sourceLabel: Type.String({ minLength: 1, maxLength: 100 }),
    disclaimer: Type.String({ minLength: 1, maxLength: 300 }),
  },
  { additionalProperties: false },
);

export const OfferSearchResponseSchema = Type.Object(
  {
    offers: Type.Array(PublicOfferSchema, { maxItems: 5 }),
    nextCursor: Type.Union([Type.String({ maxLength: 256 }), Type.Null()]),
  },
  { additionalProperties: false },
);

export type OfferSearchInput = Static<typeof OfferSearchInputSchema>;
export type PublicOffer = Static<typeof PublicOfferSchema>;
export type OfferSearchResponse = Static<typeof OfferSearchResponseSchema>;

export const OfferCatalogResponseSchema = Type.Object(
  {
    asOf: Type.String({ format: 'date-time' }),
    city: Type.Union([Type.String({ maxLength: 32 }), Type.Null()]),
    total: Type.Integer({ minimum: 0 }),
    categories: Type.Array(
      Type.Object(
        {
          code: Type.String({ minLength: 1, maxLength: 64 }),
          label: Type.String({ minLength: 1, maxLength: 64 }),
          emoji: Type.String({ minLength: 1, maxLength: 16 }),
          count: Type.Integer({ minimum: 0 }),
        },
        { additionalProperties: false },
      ),
    ),
    activities: Type.Array(
      Type.Object(
        {
          title: Type.String({ minLength: 1, maxLength: 200 }),
          summary: Type.String({ maxLength: 1000 }),
          category: Type.String({ minLength: 1, maxLength: 64 }),
          city: Type.Union([Type.String({ maxLength: 32 }), Type.Null()]),
          validUntil: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
          detailUrl: Type.String({ format: 'uri', pattern: '^https://luck\\.richisme\\.xyz/' }),
        },
        { additionalProperties: false },
      ),
      { maxItems: 20 },
    ),
    promotions: Type.Array(
      Type.Object(
        {
          title: Type.String(),
          summary: Type.String(),
          valueText: Type.String(),
          city: Type.Union([Type.String(), Type.Null()]),
          validUntil: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
          detailUrl: Type.String({ format: 'uri', pattern: '^https://luck\\.richisme\\.xyz/' }),
        },
        { additionalProperties: false },
      ),
      { maxItems: 10 },
    ),
    coupons: Type.Array(
      Type.Object(
        {
          title: Type.String(),
          summary: Type.String(),
          valueText: Type.String(),
          city: Type.Union([Type.String(), Type.Null()]),
          validUntil: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
          detailUrl: Type.String({ format: 'uri', pattern: '^https://luck\\.richisme\\.xyz/' }),
        },
        { additionalProperties: false },
      ),
      { maxItems: 10 },
    ),
  },
  { additionalProperties: false },
);

export type OfferCatalogResponse = Static<typeof OfferCatalogResponseSchema>;
