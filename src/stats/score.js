import {getStatFunc} from '../constants.js';

/**
 * Calculates score
 * @param {Record<string, number|null>} stats Stats
 * @param {string} [map=''] Map if any
 * @param {number} [multiplier=1.5] Multiplier for confidence level. Defaults at 1.5
 * @return {Score}
 */
export function calcScore(stats, map, multiplier=1.5) {
  if (map !== '') map = '_' +map;
  const KDR = getStatFunc('KDR')(stats, map);
  const WLR = getStatFunc('WLR')(stats, map);
  const FKDR = getStatFunc('FKDR')(stats, map);
  const KPG = getStatFunc('Kills per game')(stats, map);
  const LOAC = getStatFunc('Last one alive count')(stats, map);
  const FBKG = getStatFunc('Final Bow Kills per game')(stats, map);

  const games = getStatFunc('Total games')(stats, map);
  const kills = getStatFunc('Kills (total)')(stats, map);

  /* Score is calculated as followed:
  KDR will be added after square root, cap at 5
  WLR will be added, cap at 10
  KPG will be added after being squared
  LOAC will be added after log2
  FBKG will be a multiplier after adding 1 to it, cap at 4 (after addition)
  FKDR will be a multiplier after square root, cap at 5
  -------
  After ratio manipulation, some participation award! (grindScore)

  Games : log2(games+1)
  Kills : log2(kills + 1) * 2
  -------
  Final Score = skillScore * multipliers + grindScore
  */

  const skillScore = Math.min(KDR ** 0.5, 5) + Math.min(WLR, 10) + KPG ** 2 + Math.log2(LOAC || 1);
  const multipliers = Math.min(FBKG + 1, 4) * Math.min(FKDR ** 0.5, 5);
  const grindScore = Math.log2(games + 1) + Math.log2(kills + 1) * 2;
  const finalScore = skillScore * multipliers + grindScore;

  return {
    skillScore,
    multipliers,
    finalScore,
    grindScore,
    confidenceLevel: Math.min(10, games > 1 ? Math.log10(games)*multiplier : 0), // How confident the score is, 0 to 10
  };
};

/**
 * @typedef {Object} Score
 * @property {number} skillScore Score based on skill
 * @property {number} multipliers Multipliers for skill score
 * @property {number} grindScore Score based on grinding
 * @property {number} finalScore Final score
 * @property {number} confidenceLevel Level of confidence for the score (0 to 10)
 */
