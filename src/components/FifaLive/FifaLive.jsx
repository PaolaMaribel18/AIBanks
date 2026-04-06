import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowSquareOut, SoccerBall, MapPin, Trophy, Clock } from '@phosphor-icons/react';
import { useCountdown } from '../../hooks/useFifaData'; 
import { useGroupStandings } from '../../hooks/useGroupStandings';
import { useWorldCupMatches } from '../../hooks/useWorldCupMatches';
import { TOURNAMENT_INFO, FIFA_LINKS } from '../../data/fifaData';
import { getFlagByFifaCode } from '../../utils/countryFlags';
import styles from './FifaLive.module.css';

// ─── Animation variants ────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// ─── Helpers ────────────────────────────────────────────────────
function formatMatchDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
function formatMatchTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}
function timeAgo(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  return `hace ${Math.floor(s / 3600)}h`;
}

// ─── Countdown Sub-component ────────────────────────────────────
function Countdown() {
  const { days, hours, minutes, seconds, isPast } = useCountdown(TOURNAMENT_INFO.startDate);

  return (
    <motion.div className={styles.countdown} variants={fadeUp}>
      <div className={styles.countdownLabel}>⚽ {TOURNAMENT_INFO.name}</div>
      <div className={styles.countdownTitle}>
        {isPast
          ? '¡El Mundial ha comenzado!'
          : `Faltan para ${TOURNAMENT_INFO.openingMatch.match}`}
      </div>
      {isPast ? (
        <div className={styles.countdownStarted}>🏟️ EN VIVO AHORA</div>
      ) : (
        <div className={styles.countdownGrid}>
          <div className={styles.countdownUnit}>
            <motion.span className={styles.countdownNum} key={days} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {String(days).padStart(2, '0')}
            </motion.span>
            <span className={styles.countdownUnitLabel}>Días</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <motion.span className={styles.countdownNum} key={hours} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {String(hours).padStart(2, '0')}
            </motion.span>
            <span className={styles.countdownUnitLabel}>Horas</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <motion.span className={styles.countdownNum} key={minutes} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {String(minutes).padStart(2, '0')}
            </motion.span>
            <span className={styles.countdownUnitLabel}>Min</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <motion.span className={styles.countdownNum} key={seconds} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {String(seconds).padStart(2, '0')}
            </motion.span>
            <span className={styles.countdownUnitLabel}>Seg</span>
          </div>
        </div>
      )}
      <div className={styles.countdownVenue}>
        <MapPin size={12} weight="bold" />
        <span>
          {TOURNAMENT_INFO.openingMatch.venue} · {TOURNAMENT_INFO.openingMatch.city}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Ecuador Schedule ───────────────────────────────────────────
function EcuadorSchedule({ matches }) {
  if (!matches || matches.length === 0) return null;
  
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
      <div className={styles.scheduleTitle}>
        <Clock size={16} weight="bold" color="var(--gold-primary)" />
        <span>Calendario Ecuador 🇪🇨</span>
      </div>
      <motion.div className={styles.matchList} variants={stagger} initial="hidden" animate="show">
        {matches.map((match) => (
          <motion.a
            key={match.id}
            className={styles.matchItem}
            href={match.matchLink}
            target="_blank"
            rel="noopener noreferrer"
            variants={fadeUp}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.matchMeta}>
              <span className={styles.matchDate}>
                {formatMatchDate(match.date)} · {formatMatchTime(match.date)}
              </span>
            </div>
            <div className={styles.matchTeams}>
              <div className={styles.matchTeam}>
                <span className={styles.matchTeamFlag}>{match.home.flag}</span>
                <span className={styles.matchTeamName}>{match.home.name}</span>
              </div>
              <span className={styles.matchVs}>VS</span>
              <div className={styles.matchTeam}>
                <span className={styles.matchTeamFlag}>{match.away.flag}</span>
                <span className={styles.matchTeamName}>{match.away.name}</span>
              </div>
            </div>
            <div className={styles.matchVenue}>
              <MapPin size={11} weight="bold" />
              <span>{match.stadium}</span>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Featured Matches ───────────────────────────────────────────
function FeaturedMatches({ matches }) {
  if (!matches || matches.length === 0) return null;
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
      <div className={styles.scheduleTitle}>
        <span>🔥</span>
        <span>Partidos Destacados</span>
      </div>
      <div className={styles.featuredScroll}>
        {matches.map((match, i) => (
          <motion.a
            key={match.id}
            className={styles.featuredCard}
            href={match.matchLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -3 }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className={styles.featuredTeams}>
              <span className={styles.featuredFlag}>{match.home.flag}</span>
              <span className={styles.featuredVs}>VS</span>
              <span className={styles.featuredFlag}>{match.away.flag}</span>
            </div>
            <div className={styles.featuredDate}>{formatMatchDate(match.date)}</div>
            <div className={styles.featuredVenue}>
              📍 {match.stadium}
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Group Standings (Replaces Conmebol) ────────────────────────
function GroupStandings({ standingsByGroup }) {
  const groupsToSelect = Object.keys(standingsByGroup).sort();
  const [activeGroup, setActiveGroup] = useState('E'); // Ecuador por defecto
  
  if (groupsToSelect.length === 0) return null;
  
  // Si no está el E, mostramos el primero por fallback
  const validActiveGroup = groupsToSelect.includes(activeGroup) ? activeGroup : groupsToSelect[0];
  const rows = standingsByGroup[validActiveGroup];

  return (
    <motion.div className={styles.standingsCard} variants={fadeUp} initial="hidden" animate="show">
      <div className={styles.standingsHeader}>
        <div className={styles.standingsTitle}>
          <Trophy size={14} weight="bold" style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Tabla de Grupos
        </div>
      </div>
      
      {/* Group Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
        {groupsToSelect.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'none',
              background: validActiveGroup === g ? 'var(--gold-primary)' : 'rgba(255,255,255,0.05)',
              color: validActiveGroup === g ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: validActiveGroup === g ? 'bold' : 'normal',
              whiteSpace: 'nowrap'
            }}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      <table className={styles.standingsTable}>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Selección</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {rows.map((row) => (
              <motion.tr
                key={row.team.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={row.team.code === 'ECU' ? styles.rowEcuador : ''}
              >
                <td>{row.position}</td>
                <td>
                  <div className={styles.standingsTeamCell}>
                    <span className={styles.standingsFlag}>{getFlagByFifaCode(row.team.code)}</span>
                    <span className={styles.standingsTeamName}>{row.team.name}</span>
                  </div>
                </td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.goalDifference}</td>
                <td className={styles.standingsPts}>{row.points}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      
      <div className={styles.sourceInfo}>
        <span>Fuente:</span>
        <a href={FIFA_LINKS.standings} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
          FIFA.com
        </a>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export default function FifaLive() {
  const { matches, loading: matchesLoading, error: matchesError } = useWorldCupMatches();
  const { standingsByGroup, lastUpdated, error: standingError } = useGroupStandings();
  
  // Filtrar ecuador y destacados
  const ecuadorMatches = matches.filter(m => m.home.code === 'ECU' || m.away.code === 'ECU');
  const featured = matches.filter(m => m.hot).slice(0, 5); // 5 max para scroll
  
  const loading = matchesLoading || (!matchesError && !standingError && Object.keys(standingsByGroup).length === 0);
  const error = matchesError || standingError;
  
  return (
    <motion.section
      className={styles.fifaSection}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
    >
      {/* Header */}
      <div className={styles.sectionHead}>
        <div className={styles.headLeft}>
          <h3 className={styles.fifaTitle}>FIFA World Cup 2026</h3>
          <div className={styles.liveBadge} title="Sincronizado silenciosamente cada 60s">
            <span className={styles.liveDot} />
            <span>EN VIVO</span>
          </div>
        </div>
        <span className={styles.updatedAt}>
          {timeAgo(lastUpdated)}
        </span>
      </div>

      {/* Countdown */}
      <Countdown />

      {error ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', borderRadius: '12px', marginTop: '20px' }}>
          <strong>Error de Conexión FIFA API</strong>
          <p>{error}</p>
          <small>Revisa que el script de Vite esté corriendo y recarga la página.</small>
        </div>
      ) : loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
          Conectando con servidores de la FIFA...
        </div>
      ) : (
        <>
          {/* Ecuador Schedule */}
          {ecuadorMatches.length > 0 && (
            <EcuadorSchedule matches={ecuadorMatches} />
          )}

          {/* Featured Matches */}
          {featured.length > 0 && (
            <FeaturedMatches matches={featured} />
          )}

          <div className={styles.divider} />

          {/* New WC Group Standings */}
          <GroupStandings standingsByGroup={standingsByGroup} />
        </>
      )}

      {/* FIFA Link general */}
      <motion.a
        href={FIFA_LINKS.matchCentre}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.fifaLink}
        variants={fadeUp}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
      >
        <SoccerBall size={18} weight="bold" />
        <span>Abrir FIFA Match Centre</span>
        <ArrowSquareOut size={14} weight="bold" />
      </motion.a>

    </motion.section>
  );
}
