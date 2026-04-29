export const RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  SPECIAL: 'special',
  LEGENDARY: 'legendary',
  CALISTHENIC: 'calisthenic'
};

export const RARITY_MULTIPLIERS = {
  [RARITIES.COMMON]: 1.0,
  [RARITIES.RARE]: 1.1,
  [RARITIES.SPECIAL]: 1.25,
  [RARITIES.LEGENDARY]: 1.5,
  [RARITIES.CALISTHENIC]: 2.0
};

export const RARITY_COLORS = {
  [RARITIES.COMMON]: '#8fa1b3',
  [RARITIES.RARE]: '#3b82f6',
  [RARITIES.SPECIAL]: '#a34df4',
  [RARITIES.LEGENDARY]: '#ff9d00',
  [RARITIES.CALISTHENIC]: '#00ffcc'
};
