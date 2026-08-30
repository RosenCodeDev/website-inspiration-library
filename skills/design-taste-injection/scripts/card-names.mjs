const compactLegacyTitle = (value) => String(value ?? '')
  .split(' — ')[0]
  .replace(/ Portal$/, '')
  .trim();

const cardDisplayName = (card) => {
  const displayName = typeof card?.displayName === 'string' ? card.displayName.trim() : '';
  if (displayName) return displayName;
  const sourceName = typeof card?.source?.siteName === 'string' ? card.source.siteName.trim() : '';
  if (sourceName) return sourceName;
  const legacyName = compactLegacyTitle(card?.title);
  if (legacyName) return legacyName;
  throw new Error(`Card has no readable display name: ${card?.id ?? '(missing)'}`);
};

const cardIdentifierNames = (card) => [...new Set([
  cardDisplayName(card),
  typeof card?.title === 'string' ? card.title.trim() : '',
  typeof card?.source?.siteName === 'string' ? card.source.siteName.trim() : '',
].filter(Boolean))];

export { cardDisplayName, cardIdentifierNames };
