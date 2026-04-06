import { useState, useEffect, useRef } from 'react';

const STANDINGS_API_URL = "https://api.fifa.com/api/v3/calendar/17/285023/289273/standing?language=es&count=200";
const REFRESH_INTERVAL = 60_000;

export function useGroupStandings() {
  const [standingsByGroup, setStandingsByGroup] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);

  const refreshRef = useRef(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch(STANDINGS_API_URL, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json();
        
        if (data && data.Results) {
          const grouped = {};

          data.Results.forEach(item => {
            const groupText = item.Group?.[0]?.Description || '?';
            // Group text es típicamente "Grupo A"
            const groupKey = groupText.replace('Grupo ', '').trim();
            
            if (!grouped[groupKey]) {
              grouped[groupKey] = [];
            }
            
            grouped[groupKey].push({
              position: item.Position,
              points: item.Points,
              played: item.Played,
              won: item.Won,
              drawn: item.Drawn,
              lost: item.Lost,
              goalsFor: item.For,
              goalsAgainst: item.Against,
              goalDifference: item.GoalsDiference,
              team: {
                name: item.Team?.Name?.[0]?.Description || item.Team?.IdCountry,
                code: item.Team?.IdCountry
              }
            });
          });
          
          // Ordenar cada grupo por posición
          Object.keys(grouped).forEach(k => {
            grouped[k].sort((a, b) => a.position - b.position);
          });
          
          setStandingsByGroup(grouped);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error("Error fetching FIFA standings:", err);
        setError(err.message);
      }
    }

    // Primera carga
    fetchStandings();
    
    // Polling silencioso
    refreshRef.current = setInterval(fetchStandings, REFRESH_INTERVAL);
    
    return () => clearInterval(refreshRef.current);
  }, []);

  return { standingsByGroup, lastUpdated, error };
}
