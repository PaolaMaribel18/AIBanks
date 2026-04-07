import { useState, useEffect } from 'react';
import { getFlagByFifaCode } from '../utils/countryFlags';

const API_URL = "https://api.fifa.com/api/v3/calendar/matches?language=es&idCompetition=17&idSeason=285023&count=400";
const POINT_BUCKETS = [150, 200, 250, 300];

const getStableMatchPoints = (matchId) => {
  const numericId = Number(String(matchId).replace(/\D/g, '')) || 0;
  return POINT_BUCKETS[numericId % POINT_BUCKETS.length];
};

export function useWorldCupMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        // Si hay error de CORS local, podemos cambiar API_URL por '/api/fifa/v3/calendar/matches?...'
        // usando el proxy de Vite que configuramos.
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.Results) {
          const transformedMatches = data.Results.map(match => {
            
            // Extraer textos en español del arreglo "Locale"
            const getLocText = (arr) => arr?.find(item => item.Locale === 'es-ES')?.Description || arr?.[0]?.Description || '';
            
            const homeName = getLocText(match.Home?.TeamName) || 'TBD';
            const homeCode = match.Home?.IdCountry || 'TBD';
            
            const awayName = getLocText(match.Away?.TeamName) || 'TBD';
            const awayCode = match.Away?.IdCountry || 'TBD';

            const stadiumName = getLocText(match.Stadium?.Name);
            const cityName = getLocText(match.Stadium?.CityName);
            
            // Determinar grupo
            let groupName = getLocText(match.GroupName);
            if (groupName && groupName.includes('Grupo ')) {
              groupName = groupName.replace('Grupo ', '');
            } else if (!groupName) {
               // En caso de que sea cruce de eliminatorias
              groupName = getLocText(match.StageName) || '?';
            }

            // Puntos estables para que el puntaje del usuario sea consistente en toda la app
            const points = getStableMatchPoints(match.IdMatch);
            const isHot = points >= 250;

            return {
              id: match.IdMatch,
              home: {
                name: homeName,
                flag: getFlagByFifaCode(homeCode),
                code: homeCode,
              },
              away: {
                name: awayName,
                flag: getFlagByFifaCode(awayCode),
                code: awayCode,
              },
              date: match.Date,
              stadium: stadiumName && cityName ? `${stadiumName}, ${cityName}` : (stadiumName || cityName || 'TBD'),
              group: groupName,
              points: points,
              hot: isHot,
              matchLink: `https://www.fifa.com/es/match-centre/match/17/285023/${match.IdStage}/${match.IdMatch}`
            };
          });

          // Opcional: ordenar cronológicamente
          transformedMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

          setMatches(transformedMatches);
        }
      } catch (err) {
        console.error("Error fetching World Cup Matches:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  return { matches, loading, error };
}
