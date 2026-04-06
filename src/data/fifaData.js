/**
 * FIFA World Cup 2026™ — Real Curated Data
 * Sources: FIFA.com, Wikipedia, Fox Sports, MLS Soccer
 * Last verified: April 2026
 *
 * This file contains STATIC fallback data. The useFifaData hook
 * will attempt to fetch live updates and fall back to this data
 * if the external source is unavailable.
 */

// ─── Tournament Info ────────────────────────────────────────────
export const TOURNAMENT_INFO = {
  name: 'FIFA World Cup 2026™',
  edition: '23ª edición',
  host: 'Canadá · México · Estados Unidos',
  startDate: '2026-06-11T00:00:00Z',
  endDate: '2026-07-19T23:59:59Z',
  totalTeams: 48,
  totalGroups: 12,
  totalVenues: 16,
  totalCities: 16,
  format: '12 grupos de 4 → 32avos → 16avos → cuartos → semis → final',
  openingMatch: {
    date: '2026-06-11',
    time: '12:00',
    city: 'Ciudad de México',
    venue: 'Estadio Azteca',
    match: 'México vs Sudáfrica',
  },
  final: {
    date: '2026-07-19',
    city: 'East Rutherford, NJ',
    venue: 'MetLife Stadium',
  },
  officialUrl: 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026',
  matchCentreUrl: 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-centre',
};

// ─── Host Cities & Venues ───────────────────────────────────────
export const HOST_VENUES = [
  { city: 'Ciudad de México', country: '🇲🇽', venue: 'Estadio Azteca' },
  { city: 'Guadalajara', country: '🇲🇽', venue: 'Estadio Akron' },
  { city: 'Monterrey', country: '🇲🇽', venue: 'Estadio BBVA' },
  { city: 'Toronto', country: '🇨🇦', venue: 'BMO Field' },
  { city: 'Vancouver', country: '🇨🇦', venue: 'BC Place' },
  { city: 'Atlanta', country: '🇺🇸', venue: 'Mercedes-Benz Stadium' },
  { city: 'Boston', country: '🇺🇸', venue: 'Gillette Stadium' },
  { city: 'Dallas', country: '🇺🇸', venue: 'AT&T Stadium' },
  { city: 'Houston', country: '🇺🇸', venue: 'NRG Stadium' },
  { city: 'Kansas City', country: '🇺🇸', venue: 'Arrowhead Stadium' },
  { city: 'Los Angeles', country: '🇺🇸', venue: 'SoFi Stadium' },
  { city: 'Miami', country: '🇺🇸', venue: 'Hard Rock Stadium' },
  { city: 'New York/NJ', country: '🇺🇸', venue: 'MetLife Stadium' },
  { city: 'Philadelphia', country: '🇺🇸', venue: 'Lincoln Financial Field' },
  { city: 'San Francisco', country: '🇺🇸', venue: "Levi's Stadium" },
  { city: 'Seattle', country: '🇺🇸', venue: 'Lumen Field' },
];

// ─── Key Dates ──────────────────────────────────────────────────
export const KEY_DATES = [
  { label: 'Fase de Grupos', start: '2026-06-11', end: '2026-06-27' },
  { label: '32avos de Final', start: '2026-06-28', end: '2026-07-03' },
  { label: '16avos de Final', start: '2026-07-04', end: '2026-07-07' },
  { label: 'Cuartos de Final', start: '2026-07-09', end: '2026-07-11' },
  { label: 'Semifinales', start: '2026-07-14', end: '2026-07-15' },
  { label: 'Tercer Puesto', start: '2026-07-18', end: '2026-07-18' },
  { label: 'FINAL', start: '2026-07-19', end: '2026-07-19' },
];

// ─── All 48 Qualified Teams ─────────────────────────────────────
export const ALL_TEAMS = {
  // Hosts
  CAN: { name: 'Canadá', flag: '🇨🇦', code: 'CAN', conf: 'CONCACAF', host: true },
  MEX: { name: 'México', flag: '🇲🇽', code: 'MEX', conf: 'CONCACAF', host: true },
  USA: { name: 'Estados Unidos', flag: '🇺🇸', code: 'USA', conf: 'CONCACAF', host: true },
  // AFC
  AUS: { name: 'Australia', flag: '🇦🇺', code: 'AUS', conf: 'AFC' },
  IRQ: { name: 'Iraq', flag: '🇮🇶', code: 'IRQ', conf: 'AFC' },
  IRN: { name: 'Irán', flag: '🇮🇷', code: 'IRN', conf: 'AFC' },
  JPN: { name: 'Japón', flag: '🇯🇵', code: 'JPN', conf: 'AFC' },
  JOR: { name: 'Jordania', flag: '🇯🇴', code: 'JOR', conf: 'AFC' },
  KOR: { name: 'Corea del Sur', flag: '🇰🇷', code: 'KOR', conf: 'AFC' },
  QAT: { name: 'Qatar', flag: '🇶🇦', code: 'QAT', conf: 'AFC' },
  KSA: { name: 'Arabia Saudita', flag: '🇸🇦', code: 'KSA', conf: 'AFC' },
  UZB: { name: 'Uzbekistán', flag: '🇺🇿', code: 'UZB', conf: 'AFC' },
  // CAF
  ALG: { name: 'Argelia', flag: '🇩🇿', code: 'ALG', conf: 'CAF' },
  CPV: { name: 'Cabo Verde', flag: '🇨🇻', code: 'CPV', conf: 'CAF' },
  COD: { name: 'RD Congo', flag: '🇨🇩', code: 'COD', conf: 'CAF' },
  CIV: { name: 'Costa de Marfil', flag: '🇨🇮', code: 'CIV', conf: 'CAF' },
  EGY: { name: 'Egipto', flag: '🇪🇬', code: 'EGY', conf: 'CAF' },
  GHA: { name: 'Ghana', flag: '🇬🇭', code: 'GHA', conf: 'CAF' },
  MAR: { name: 'Marruecos', flag: '🇲🇦', code: 'MAR', conf: 'CAF' },
  SEN: { name: 'Senegal', flag: '🇸🇳', code: 'SEN', conf: 'CAF' },
  RSA: { name: 'Sudáfrica', flag: '🇿🇦', code: 'RSA', conf: 'CAF' },
  TUN: { name: 'Túnez', flag: '🇹🇳', code: 'TUN', conf: 'CAF' },
  // CONCACAF (extra)
  CUW: { name: 'Curazao', flag: '🇨🇼', code: 'CUW', conf: 'CONCACAF' },
  HAI: { name: 'Haití', flag: '🇭🇹', code: 'HAI', conf: 'CONCACAF' },
  PAN: { name: 'Panamá', flag: '🇵🇦', code: 'PAN', conf: 'CONCACAF' },
  // CONMEBOL
  ARG: { name: 'Argentina', flag: '🇦🇷', code: 'ARG', conf: 'CONMEBOL' },
  BRA: { name: 'Brasil', flag: '🇧🇷', code: 'BRA', conf: 'CONMEBOL' },
  COL: { name: 'Colombia', flag: '🇨🇴', code: 'COL', conf: 'CONMEBOL' },
  ECU: { name: 'Ecuador', flag: '🇪🇨', code: 'ECU', conf: 'CONMEBOL' },
  PAR: { name: 'Paraguay', flag: '🇵🇾', code: 'PAR', conf: 'CONMEBOL' },
  URU: { name: 'Uruguay', flag: '🇺🇾', code: 'URU', conf: 'CONMEBOL' },
  // OFC
  NZL: { name: 'Nueva Zelanda', flag: '🇳🇿', code: 'NZL', conf: 'OFC' },
  // UEFA
  AUT: { name: 'Austria', flag: '🇦🇹', code: 'AUT', conf: 'UEFA' },
  BEL: { name: 'Bélgica', flag: '🇧🇪', code: 'BEL', conf: 'UEFA' },
  BIH: { name: 'Bosnia y Herz.', flag: '🇧🇦', code: 'BIH', conf: 'UEFA' },
  CRO: { name: 'Croacia', flag: '🇭🇷', code: 'CRO', conf: 'UEFA' },
  CZE: { name: 'Chequia', flag: '🇨🇿', code: 'CZE', conf: 'UEFA' },
  ENG: { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG', conf: 'UEFA' },
  FRA: { name: 'Francia', flag: '🇫🇷', code: 'FRA', conf: 'UEFA' },
  GER: { name: 'Alemania', flag: '🇩🇪', code: 'GER', conf: 'UEFA' },
  NED: { name: 'Países Bajos', flag: '🇳🇱', code: 'NED', conf: 'UEFA' },
  NOR: { name: 'Noruega', flag: '🇳🇴', code: 'NOR', conf: 'UEFA' },
  POR: { name: 'Portugal', flag: '🇵🇹', code: 'POR', conf: 'UEFA' },
  SCO: { name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'SCO', conf: 'UEFA' },
  ESP: { name: 'España', flag: '🇪🇸', code: 'ESP', conf: 'UEFA' },
  SWE: { name: 'Suecia', flag: '🇸🇪', code: 'SWE', conf: 'UEFA' },
  SUI: { name: 'Suiza', flag: '🇨🇭', code: 'SUI', conf: 'UEFA' },
  TUR: { name: 'Turquía', flag: '🇹🇷', code: 'TUR', conf: 'UEFA' },
};

// ─── Official Groups (Draw: Dec 5, 2025 — Washington D.C.) ─────
export const WC2026_GROUPS = {
  A: { name: 'Grupo A', teams: ['MEX', 'RSA', 'KOR', 'CZE'] },
  B: { name: 'Grupo B', teams: ['CAN', 'BIH', 'QAT', 'SUI'] },
  C: { name: 'Grupo C', teams: ['BRA', 'MAR', 'HAI', 'SCO'] },
  D: { name: 'Grupo D', teams: ['USA', 'PAR', 'AUS', 'TUR'] },
  E: { name: 'Grupo E', teams: ['GER', 'CUW', 'CIV', 'ECU'], ecuador: true },
  F: { name: 'Grupo F', teams: ['NED', 'JPN', 'SWE', 'TUN'] },
  G: { name: 'Grupo G', teams: ['BEL', 'EGY', 'IRN', 'NZL'] },
  H: { name: 'Grupo H', teams: ['ESP', 'CPV', 'KSA', 'URU'] },
  I: { name: 'Grupo I', teams: ['FRA', 'SEN', 'IRQ', 'NOR'] },
  J: { name: 'Grupo J', teams: ['ARG', 'ALG', 'AUT', 'JOR'] },
  K: { name: 'Grupo K', teams: ['POR', 'COD', 'UZB', 'COL'] },
  L: { name: 'Grupo L', teams: ['ENG', 'CRO', 'GHA', 'PAN'] },
};

// ─── Ecuador Schedule (Group E) — Real Dates & Venues ──────────
export const ECUADOR_SCHEDULE = [
  {
    id: 'ecu-1',
    matchday: 1,
    date: '2026-06-14T23:00:00Z', // 7:00 PM ET
    home: 'ECU',
    away: 'CIV',
    venue: 'Lincoln Financial Field',
    city: 'Philadelphia',
    group: 'E',
    fifaUrl: 'https://www.fifa.com/es/match-centre/match/17/285023/289273/400021488',
  },
  {
    id: 'ecu-2',
    matchday: 2,
    date: '2026-06-21T00:00:00Z', // 8:00 PM ET
    home: 'ECU',
    away: 'CUW',
    venue: 'Arrowhead Stadium',
    city: 'Kansas City',
    group: 'E',
    fifaUrl: 'https://www.fifa.com/es/match-centre/match/17/285023/289273/400021488',
  },
  {
    id: 'ecu-3',
    matchday: 3,
    date: '2026-06-25T20:00:00Z', // 4:00 PM ET
    home: 'ECU',
    away: 'GER',
    venue: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    group: 'E',
    fifaUrl: 'https://www.fifa.com/es/match-centre/match/17/285023/289273/400021488',
  },
];

// ─── Featured Matches (Various Groups) ──────────────────────────
export const FEATURED_MATCHES = [
  {
    id: 'feat-1',
    date: '2026-06-11T18:00:00Z',
    home: 'MEX',
    away: 'RSA',
    venue: 'Estadio Azteca',
    city: 'Ciudad de México',
    group: 'A',
    tag: 'INAUGURACIÓN',
  },
  {
    id: 'feat-2',
    date: '2026-06-12T00:00:00Z',
    home: 'ARG',
    away: 'ALG',
    venue: 'Hard Rock Stadium',
    city: 'Miami',
    group: 'J',
    tag: 'CAMPEÓN DEL MUNDO',
  },
  {
    id: 'feat-3',
    date: '2026-06-13T23:00:00Z',
    home: 'BRA',
    away: 'MAR',
    venue: 'AT&T Stadium',
    city: 'Dallas',
    group: 'C',
    tag: 'CLÁSICO',
  },
  {
    id: 'feat-4',
    date: '2026-06-14T20:00:00Z',
    home: 'ESP',
    away: 'URU',
    venue: 'Hard Rock Stadium',
    city: 'Miami',
    group: 'H',
    tag: 'DUELO TOP',
  },
  {
    id: 'feat-5',
    date: '2026-06-15T23:00:00Z',
    home: 'ENG',
    away: 'CRO',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    group: 'L',
    tag: 'REVANCHA',
  },
];

// ─── CONMEBOL Qualifiers — Final Standings (March 2026) ─────────
export const CONMEBOL_STANDINGS = [
  { pos: 1, code: 'ARG', pts: 38, pj: 18, pg: 11, pe: 5, pp: 2, gf: 31, gc: 10, dg: '+21', status: 'qualified' },
  { pos: 2, code: 'ECU', pts: 29, pj: 18, pg: 8, pe: 5, pp: 5, gf: 14, gc: 5, dg: '+9', status: 'qualified' },
  { pos: 3, code: 'COL', pts: 28, pj: 18, pg: 7, pe: 7, pp: 4, gf: 28, gc: 18, dg: '+10', status: 'qualified' },
  { pos: 4, code: 'URU', pts: 28, pj: 18, pg: 8, pe: 4, pp: 6, gf: 22, gc: 12, dg: '+10', status: 'qualified' },
  { pos: 5, code: 'BRA', pts: 28, pj: 18, pg: 8, pe: 4, pp: 6, gf: 24, gc: 17, dg: '+7', status: 'qualified' },
  { pos: 6, code: 'PAR', pts: 25, pj: 18, pg: 7, pe: 4, pp: 7, gf: 16, gc: 17, dg: '-1', status: 'qualified' },
  { pos: 7, code: 'BOL', pts: 21, pj: 18, pg: 6, pe: 3, pp: 9, gf: 20, gc: 28, dg: '-8', status: 'playoff' },
  { pos: 8, code: 'VEN', pts: 18, pj: 18, pg: 5, pe: 3, pp: 10, gf: 15, gc: 22, dg: '-7', status: 'eliminated' },
  { pos: 9, code: 'PER', pts: 15, pj: 18, pg: 3, pe: 6, pp: 9, gf: 10, gc: 21, dg: '-11', status: 'eliminated' },
  { pos: 10, code: 'CHI', pts: 13, pj: 18, pg: 3, pe: 4, pp: 11, gf: 12, gc: 24, dg: '-12', status: 'eliminated' },
];

// Extra teams for standings display
export const CONMEBOL_EXTRA_TEAMS = {
  BOL: { name: 'Bolivia', flag: '🇧🇴', code: 'BOL' },
  VEN: { name: 'Venezuela', flag: '🇻🇪', code: 'VEN' },
  PER: { name: 'Perú', flag: '🇵🇪', code: 'PER' },
  CHI: { name: 'Chile', flag: '🇨🇱', code: 'CHI' },
};

// ─── FIFA Links ─────────────────────────────────────────────────
export const FIFA_LINKS = {
  worldCup: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026',
  matchCentre: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=EC&wtw-filter=ALL',
  scores: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures',
  standings: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/standings',
  conmebol: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/qualifiers/conmebol/standings',
  ecuador: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/teams/ecuador',
};

// ─── Helper ─────────────────────────────────────────────────────
export function getTeam(code) {
  return ALL_TEAMS[code] || CONMEBOL_EXTRA_TEAMS[code] || { name: code, flag: '🏳️', code };
}
