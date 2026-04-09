// Real World Cup 2026 Groups (subset for predictions feature)
export const WORLD_CUP_GROUPS = {
  E: [
    { name: 'Alemania', flag: '🇩🇪', code: 'GER' },
    { name: 'Curazao', flag: '🇨🇼', code: 'CUW' },
    { name: 'Costa de Marfil', flag: '🇨🇮', code: 'CIV' },
    { name: 'Ecuador', flag: '🇪🇨', code: 'ECU' },
  ],
  A: [
    { name: 'México', flag: '🇲🇽', code: 'MEX' },
    { name: 'Sudáfrica', flag: '🇿🇦', code: 'RSA' },
    { name: 'Corea del Sur', flag: '🇰🇷', code: 'KOR' },
    { name: 'Chequia', flag: '🇨🇿', code: 'CZE' },
  ],
  J: [
    { name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
    { name: 'Argelia', flag: '🇩🇿', code: 'ALG' },
    { name: 'Austria', flag: '🇦🇹', code: 'AUT' },
    { name: 'Jordania', flag: '🇯🇴', code: 'JOR' },
  ],
  H: [
    { name: 'España', flag: '🇪🇸', code: 'ESP' },
    { name: 'Cabo Verde', flag: '🇨🇻', code: 'CPV' },
    { name: 'Arabia Saudita', flag: '🇸🇦', code: 'KSA' },
    { name: 'Uruguay', flag: '🇺🇾', code: 'URU' },
  ],
};

export const UPCOMING_MATCHES = [
  // Real Ecuador World Cup 2026 Schedule (Group E)
  {
    id: 1,
    home: { name: 'Ecuador', flag: '🇪🇨', code: 'ECU' },
    away: { name: 'Costa de Marfil', flag: '🇨🇮', code: 'CIV' },
    date: '2026-06-14T23:00:00',
    stadium: 'Lincoln Financial Field, Philadelphia',
    group: 'E',
    odds: { home: 2.3, draw: 3.1, away: 3.0 },
    points: 200,
    hot: true,
  },
  {
    id: 2,
    home: { name: 'Ecuador', flag: '🇪🇨', code: 'ECU' },
    away: { name: 'Curazao', flag: '🇨🇼', code: 'CUW' },
    date: '2026-06-21T00:00:00',
    stadium: 'Arrowhead Stadium, Kansas City',
    group: 'E',
    odds: { home: 1.4, draw: 4.2, away: 7.5 },
    points: 150,
    hot: false,
  },
  {
    id: 3,
    home: { name: 'Ecuador', flag: '🇪🇨', code: 'ECU' },
    away: { name: 'Alemania', flag: '🇩🇪', code: 'GER' },
    date: '2026-06-25T20:00:00',
    stadium: 'MetLife Stadium, East Rutherford NJ',
    group: 'E',
    odds: { home: 3.8, draw: 3.4, away: 1.9 },
    points: 300,
    hot: true,
  },
  // Other Group Highlights
  {
    id: 4,
    home: { name: 'México', flag: '🇲🇽', code: 'MEX' },
    away: { name: 'Sudáfrica', flag: '🇿🇦', code: 'RSA' },
    date: '2026-06-11T18:00:00',
    stadium: 'Estadio Azteca, Ciudad de México',
    group: 'A',
    odds: { home: 1.7, draw: 3.5, away: 4.8 },
    points: 250,
    hot: true,
  },
  {
    id: 5,
    home: { name: 'Argentina', flag: '🇦🇷', code: 'ARG' },
    away: { name: 'Argelia', flag: '🇩🇿', code: 'ALG' },
    date: '2026-06-12T00:00:00',
    stadium: 'Hard Rock Stadium, Miami',
    group: 'J',
    odds: { home: 1.3, draw: 5.0, away: 8.0 },
    points: 200,
    hot: true,
  },
  {
    id: 6,
    home: { name: 'España', flag: '🇪🇸', code: 'ESP' },
    away: { name: 'Uruguay', flag: '🇺🇾', code: 'URU' },
    date: '2026-06-14T20:00:00',
    stadium: 'Hard Rock Stadium, Miami',
    group: 'H',
    odds: { home: 2.1, draw: 3.2, away: 3.4 },
    points: 250,
    hot: false,
  },
];

export const REWARDS_CATALOG = [
  // COMPETIDOR
  { id: 1, name: 'PlayStation 5 Digital', description: 'Edición Digital para competir al máximo.', cost: 6500, icon: '🎮', category: 'entertainment', popular: true, archetype: 'competidor' },
  { id: 2, name: 'Switch OLED', description: 'Consola híbrida con pantalla OLED.', cost: 5000, icon: '🕹️', category: 'entertainment', popular: false, archetype: 'competidor' },
  { id: 3, name: 'Galaxy Watch', description: 'Mide tus marcas y pulsa la competencia.', cost: 3500, icon: '⌚', category: 'merchandise', popular: false, archetype: 'competidor' },
  { id: 4, name: 'Camiseta Oficial', description: 'Camiseta de tu selección favorita.', cost: 1500, icon: '👕', category: 'merchandise', popular: true, archetype: 'competidor' },
  // ACUMULADOR
  { id: 5, name: 'Gran Bono mAiles', description: 'Canjea un multiplicador para tu próximo nivel.', cost: 2500, icon: '🚀', category: 'experiencias', popular: true, archetype: 'acumulador' },
  { id: 6, name: 'Maleta Samsonite', description: 'Perfecta para acumular millas de viaje.', cost: 4000, icon: '🧳', category: 'merchandise', popular: false, archetype: 'acumulador' },
  { id: 7, name: 'Moto G', description: 'Smartphone Android de excelente batería.', cost: 4500, icon: '📱', category: 'entertainment', popular: false, archetype: 'acumulador' },
  { id: 8, name: 'Audífonos Sony', description: 'Inalámbricos de alta fidelidad sonora.', cost: 3000, icon: '🎧', category: 'entertainment', popular: true, archetype: 'acumulador' },
  // PRACTICO
  { id: 9, name: 'Cashback Directo', description: 'Recibe dinero directo en tu cuenta.', cost: 800, icon: '💵', category: 'cashback', popular: true, archetype: 'practico' },
  { id: 10, name: 'Gift Card Supermaxi', description: 'Cupón aplicable de forma inmediata.', cost: 1000, icon: '💳', category: 'cashback', popular: true, archetype: 'practico' },
  { id: 11, name: 'Parlante JBL', description: 'Portátil y útil en cualquier ocasión.', cost: 2000, icon: '🔊', category: 'merchandise', popular: false, archetype: 'practico' },
  { id: 12, name: 'Power Bank Xiaomi', description: 'Batería de 20000 mAh ultrarrápida.', cost: 1200, icon: '🔋', category: 'merchandise', popular: false, archetype: 'practico' },
  // FINANCIEROS (Nuevos para AIBank)
  { id: 13, name: 'Cero Mantenimiento', description: 'Exoneración cuota de manejo tarjeta (3 meses).', cost: 800, icon: '🏦', category: 'financial', popular: true, archetype: 'practico' },
  { id: 14, name: 'Bono Hipoteca', description: '$15 para tu próxima cuota crediticia.', cost: 1500, icon: '🏠', category: 'financial', popular: true, archetype: 'competidor' },
  { id: 15, name: '-1% Interés', description: 'Reducción en la tasa de tu próximo préstamo.', cost: 2500, icon: '📉', category: 'financial', popular: false, archetype: 'acumulador' },
];

export const LEADERBOARD_DATA = [
  { rank: 1, name: 'Carlos M.', avatar: '🦁', points: 12450, streak: 8, badge: '🏆' },
  { rank: 2, name: 'María L.', avatar: '🐯', points: 11200, streak: 6, badge: '🥈' },
  { rank: 3, name: 'Andrés P.', avatar: '🐺', points: 10800, streak: 7, badge: '🥉' },
  { rank: 4, name: 'Sofía R.', avatar: '🦊', points: 9500, streak: 5, badge: '⭐' },
  { rank: 5, name: 'Diego T.', avatar: '🐻', points: 8900, streak: 4, badge: '⭐' },
  { rank: 6, name: 'Valentina C.', avatar: '🐼', points: 8100, streak: 3, badge: '⭐' },
  { rank: 7, name: 'Juan S.', avatar: '🦅', points: 7600, streak: 5, badge: '⭐' },
  { rank: 8, name: 'Camila V.', avatar: '🦋', points: 7200, streak: 2, badge: '⭐' },
  { rank: 9, name: 'Luis H.', avatar: '🐲', points: 6800, streak: 4, badge: '⭐' },
  { rank: 10, name: 'Ana G.', avatar: '🦄', points: 6500, streak: 3, badge: '⭐' },
];

export const USER_PROFILE = {
  name: 'Isaac',
  tier: 'VIP Gold',
  avatar: '🐉',
  points: 4250,
  totalPredictions: 45,
  correctPredictions: 28,
  winRate: 62,
  streak: 4,
  rank: 15,
  joined: '2026-01-15',
  achievements: [
    { id: 1, name: 'Primera Predicción', icon: '🎯', unlocked: true },
    { id: 2, name: 'Racha de 3', icon: '🔥', unlocked: true },
    { id: 3, name: 'Experto', icon: '🧠', unlocked: true },
    { id: 4, name: 'Racha de 5', icon: '⚡', unlocked: false },
    { id: 5, name: 'Top 10', icon: '🏅', unlocked: false },
    { id: 6, name: 'Leyenda', icon: '👑', unlocked: false },
  ],
  recentActivity: [
    { match: 'Ecuador vs México', prediction: 'Ecuador', result: 'win', points: '+150' },
    { match: 'Argentina vs Colombia', prediction: 'Empate', result: 'loss', points: '0' },
    { match: 'Brasil vs Alemania', prediction: 'Brasil', result: 'win', points: '+250' },
  ],
};
