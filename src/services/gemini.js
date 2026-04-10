const DEFAULT_MODEL = 'gemini-2.5-flash';

const ARCHETYPES = ['competidor', 'acumulador', 'practico'];

const PRIZE_LIBRARY = {
  competidor: [
    'Viaje al Mundial 2026',
    'Entradas VIP',
    'Camiseta oficial',
    'Upgrade de tarjeta / beneficios premium',
    'PlayStation 5',
  ],
  acumulador: [
    'Millas',
    'Cashback acumulado alto',
    'Maleta premium',
    'Celular gama media',
    'Audífonos inalámbricos',
  ],
  practico: [
    'Cashback inmediato',
    'Gift card',
    'Descuentos en comercios aliados',
    'Parlante portátil',
    'Power bank',
  ],
};

function sleepWithAbort(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    const cleanup = () => {
      signal?.removeEventListener?.('abort', onAbort);
    };

    signal?.addEventListener?.('abort', onAbort, { once: true });
  });
}

function parseRetryAfterMsFromHeaders(res) {
  try {
    const raw = res?.headers?.get?.('retry-after');
    if (!raw) return null;

    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);

    const dateMs = Date.parse(raw);
    if (!Number.isNaN(dateMs)) {
      const delta = dateMs - Date.now();
      return delta > 0 ? delta : 0;
    }
  } catch {
    // ignore
  }
  return null;
}

function parseRetryDelayMsFromGeminiErrorText(errorText) {
  const text = String(errorText || '').trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    const retryInfo = Array.isArray(parsed?.error?.details)
      ? parsed.error.details.find((d) => String(d?.['@type'] || '').includes('RetryInfo'))
      : null;
    const retryDelay = String(retryInfo?.retryDelay || '').trim();
    const match = retryDelay.match(/(\d+(?:\.\d+)?)s/i);
    if (match) return Math.round(Number(match[1]) * 1000);
  } catch {
    // ignore
  }

  const msgMatch = text.match(/retry\s+in\s+(\d+(?:\.\d+)?)s/i);
  if (msgMatch) return Math.round(Number(msgMatch[1]) * 1000);

  return null;
}

export function isGeminiConfigured() {
  return Boolean(String(import.meta.env.VITE_GEMINI_API_KEY || '').trim());
}

function normalizeModelName(value) {
  const raw = String(value || '').trim();
  if (!raw) return DEFAULT_MODEL;

  // Allow users to paste full resource names from the API (e.g. "models/gemini-2.5-flash")
  const withoutPrefix = raw.startsWith('models/') ? raw.slice('models/'.length) : raw;

  // Back-compat: older defaults used in this repo.
  if (withoutPrefix === 'gemini-1.5-flash') return DEFAULT_MODEL;
  if (withoutPrefix === 'gemini-1.5-pro') return 'gemini-2.5-pro';

  return withoutPrefix;
}

function safeJsonExtract(text) {
  if (!text) return null;

  // Remove common Markdown code fences
  const cleaned = String(text)
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Fast path
  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to extract first JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    const candidate = cleaned.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

function normalizeArchetype(value) {
  const raw = String(value || '').toLowerCase().trim();
  if (ARCHETYPES.includes(raw)) return raw;

  if (raw.includes('compet')) return 'competidor';
  if (raw.includes('acumul')) return 'acumulador';
  if (raw.includes('pract')) return 'practico';

  return null;
}

function normalizeRecommendedRewards(rewards) {
  if (!Array.isArray(rewards)) return [];

  return rewards
    .map((item) => {
      if (typeof item === 'string') {
        return { nombre: item, razon: '' };
      }
      if (item && typeof item === 'object') {
        return {
          nombre: String(item.nombre || item.premio || item.title || '').trim(),
          razon: String(item.razon || item.porque || item.reason || '').trim(),
        };
      }
      return null;
    })
    .filter((x) => x && x.nombre);
}

function buildGeminiPrompt(context) {
  const {
    userName,
    currentPoints,
    predictionsCount,
    redeemedCount,
    redeemedCategories,
    financialTier,
    creditRating,
    questionnaireSelections,
  } = context;

  const allowedRewards = {
    competidor: PRIZE_LIBRARY.competidor,
    acumulador: PRIZE_LIBRARY.acumulador,
    practico: PRIZE_LIBRARY.practico,
  };

  return [
    'Eres un asistente experto en personalización y engagement para una app de gamificación (pronósticos deportivos + puntos + canje de premios).',
    'Tu tarea es inferir el arquetipo del usuario y recomendar premios que maximicen participación, engagement, fidelización y retención.',
    '',
    'ARQUETIPOS (elige SOLO uno):',
    '- competidor: ganar, destacar, ranking, reconocimiento; premia estatus, experiencias y aspiracionales.',
    '- acumulador: progreso, puntos, metas, acumulación de valor; premia largo plazo y crecimiento.',
    '- practico: beneficios rápidos, útiles y fáciles de canjear; premia inmediatez y claridad.',
    '',
    'CALIFICACIÓN CREDITICIA (si aplica):',
    '- A: altas deudas o préstamos, buen pago',
    '- B: bajas deudas o préstamos, buen pago',
    '- C: bajas deudas o préstamos, mal pago',
    '- D: altas deudas o préstamos, mal pago',
    '',
    'PREMIOS PERMITIDOS POR ARQUETIPO (elige 3 a 5 para recomendar, NO inventes otros):',
    `- competidor: ${allowedRewards.competidor.join('; ')}`,
    `- acumulador: ${allowedRewards.acumulador.join('; ')}`,
    `- practico: ${allowedRewards.practico.join('; ')}`,
    '',
    'INFORMACIÓN DISPONIBLE DEL USUARIO (prompt dinámico):',
    `- nombre: ${userName || 'N/D'}`,
    `- puntos_actuales: ${Number.isFinite(currentPoints) ? currentPoints : 'N/D'}`,
    `- predicciones_realizadas: ${Number.isFinite(predictionsCount) ? predictionsCount : 'N/D'}`,
    `- canjes_realizados: ${Number.isFinite(redeemedCount) ? redeemedCount : 'N/D'}`,
    `- categorias_canjeadas: ${redeemedCategories?.length ? redeemedCategories.join(', ') : 'N/D'}`,
    `- tier_financiero: ${financialTier || 'N/D'}`,
    `- calificacion_crediticia: ${creditRating || 'N/D'}`,
    '',
    'RESPUESTAS DEL CUESTIONARIO (si existen):',
    questionnaireSelections?.length
      ? questionnaireSelections
          .map((s) => `- Q${s.id}: ${s.text} (tag=${s.value})`)
          .join('\n')
      : '- N/D',
    '',
    'SALIDA OBLIGATORIA: responde SOLO un JSON válido (sin markdown, sin texto adicional) con esta forma:',
    '{',
    '  "arquetipo": "competidor|acumulador|practico",',
    '  "premios_recomendados": [',
    '    { "nombre": "...", "razon": "..." }',
    '  ],',
    '  "mensaje": {',
    '    "recomendacion": "...",',
    '    "motivacion": "...",',
    '    "retencion": "..."',
    '  },',
    '  "confianza": 0.0',
    '}',
  ].join('\n');
}

async function callGeminiAPI(payload, options = {}) {
  const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Falta configurar VITE_GEMINI_API_KEY');
  }

  const model = normalizeModelName(import.meta.env.VITE_GEMINI_MODEL);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const MAX_429_DELAY_MS = 30_000;
  let rateRetryUsed = false;
  let res;
  let data;

  while (true) {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: options.signal,
    });

    if (res.ok) {
      data = await res.json();
      break;
    }

    const errorText = await res.text().catch(() => '');

    if (res.status === 429 && !rateRetryUsed) {
      const retryAfterMs =
        parseRetryAfterMsFromHeaders(res) ??
        parseRetryDelayMsFromGeminiErrorText(errorText);

      if (Number.isFinite(retryAfterMs) && retryAfterMs > 0 && retryAfterMs <= MAX_429_DELAY_MS) {
        rateRetryUsed = true;
        await sleepWithAbort(retryAfterMs + 250, options.signal);
        continue;
      }
    }

    throw new Error(`Gemini HTTP ${res.status}${errorText ? `: ${errorText}` : ''}`);
  }

  return data;
}

export async function inferArchetypeWithGemini(context, options = {}) {
  const prompt = buildGeminiPrompt(context);

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 512,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  const data = await callGeminiAPI(payload, options);

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text)
      .filter(Boolean)
      .join('\n') ||
    '';

  const json = safeJsonExtract(text);
  if (!json) {
    throw new Error('Gemini no devolvió JSON parseable');
  }

  const archetype = normalizeArchetype(json.arquetipo);
  const premios_recomendados = normalizeRecommendedRewards(json.premios_recomendados);

  const mensaje = json.mensaje && typeof json.mensaje === 'object'
    ? {
        recomendacion: String(json.mensaje.recomendacion || '').trim(),
        motivacion: String(json.mensaje.motivacion || '').trim(),
        retencion: String(json.mensaje.retencion || '').trim(),
      }
    : { recomendacion: '', motivacion: '', retencion: '' };

  const confianzaRaw = Number(json.confianza);
  const confianza = Number.isFinite(confianzaRaw)
    ? Math.max(0, Math.min(1, confianzaRaw))
    : null;

  return {
    arquetipo: archetype,
    premios_recomendados,
    mensaje,
    confianza,
    raw: json,
  };
}

export async function getChatResponse(messages, options = {}) {
  const CHATBOT_SYSTEM_INSTRUCTION = [
    "Eres 'AI-AGENT', el asistente integrado dentro de la app móvil/web AIBanks.",
    "Tu objetivo es ayudar al usuario a entender y usar cualquier parte de la aplicación (navegación, pronósticos, puntos/mAIles, premios, transferencias, tarjeta digital, pagos de servicios, perfil, ranking, temporada Mundial, notificaciones, tour guiado y configuración).",
    "",
    "REGLAS DE FORMATO (muy importante):",
    "1) Responde SOLO en texto plano. NO uses Markdown: no uses **, no uses #, no uses viñetas con '-' estilo markdown, no uses bloques de código.",
    "2) Si das pasos, usa numeración así: 1) 2) 3) en líneas separadas.",
    "3) Mantén respuestas concisas (máx. 6-8 líneas). Si el usuario pide detalle, profundiza.",
    "4) Puedes usar 0 a 2 emojis relevantes por respuesta (⚽🏦💰🏆🎁🤖).",
    "",
    "MAPA RÁPIDO (usa estos nombres reales al guiar al usuario):",
    "1) Perfil: se abre al oprimir tu nombre (parte superior). (Ruta interna: Profile)",
    "2) Banco / Inicio: ícono de la casa donde dice 'Banco'. Balance y acciones (transferir, pagar servicios, activar tarjeta digital, misiones bancarias). (Ruta interna: Home)",
    "3) Mundial: ícono del balón. Es la Temporada. Dentro hay un slide bar con secciones:",
    "   1) Desafíos: retos y pronósticos por equipos; si tocas 'Ver todos' te manda a la lista completa de partidos.",
    "   2) Pronósticos: ves todos tus pronósticos y tus resultados.",
    "   3) En vivo: info del Mundial/FIFA (fechas, equipos, puntajes por equipos) y contador para el Mundial.",
    "   (Ruta interna base: Season / WorldCupSeason)",
    "4) Pronósticos (lista completa de partidos): pantalla con todos los partidos para pronosticar. (Ruta interna: Predictions)",
    "5) Beneficios: premios y canje con puntos/mAIles, y análisis de IA por arquetipo para recomendar premios. (Ruta interna: Rewards)",
    "6) Ranking: posición del usuario y comparación con otros. (Ruta interna: Leaderboard)",
    "7) Acceso/Registro: Login, Register, AuthCallback (inicio de sesión con Supabase).",
    "",
    "SI PREGUNTAN '¿qué tiene de interesante la app?' (responde con ejemplos concretos):",
    "1) Gamificación: ganas mAIles/puntos con pronósticos, misiones y bonus; y los canjeas en Beneficios.",
    "2) Mundial en una sola app: pronósticos, resultados, datos en vivo y ranking de usuarios.",
    "3) IA aplicada: análisis por arquetipo y recomendaciones de premios según tu perfil.",
    "4) Experiencia tipo banco: balance, transferencias, pagos de servicios y tarjeta digital (según lo disponible en la app).",
    "",
    "CONCEPTOS CLAVE (explica si te preguntan):",
    "• mAIles: moneda de gamificación. Se gana con pronósticos, misiones (transferir, pagar servicios, activar tarjeta) y bonus. Se gasta al canjear premios.",
    "• Puntos: puntaje ligado a pronósticos/actividad; se refleja en progreso y ranking.",
    "• Tier financiero: nivel (ej. Bronze/Silver/Gold) que clasifica al usuario.",
    "• Arquetipo: perfil de motivación (competidor/acumulador/práctico) usado para recomendar premios.",
    "",
    "TRANSFERENCIAS (cómo explicarlas):",
    "• El flujo típico es: elegir destinatario > ingresar monto > confirmar envío.",
    "• Si el usuario pregunta por saldo: el saldo vive en el perfil y se actualiza al completar la transferencia.",
    "• Si el destinatario no ve el saldo al instante: indica esperar a la notificación/actualización (sin culpar al usuario).",
    "",
    "PREMIOS Y RECOMENDACIONES IA:",
    "• Existe un módulo de IA para recomendar premios basado en arquetipo y comportamiento.",
    "• El chatbot flotante NO debe mezclar recomendaciones internas con resultados de transferencias; responde según la pregunta del usuario.",
    "",
    "LIMITACIONES Y SEGURIDAD (no inventar):",
    "• No inventes saldos, puntos exactos, ranking exacto, o datos personales si no están en el mensaje.",
    "• Si preguntan por datos privados: explica que no puedes ver información personal y guía dónde verlo en la app.",
    "• No des asesoría financiera real; mantente en ayuda de uso de la app y gamificación.",
    "",
    "ESTILO:",
    "• Amigable, claro y orientado a acción.",
    "• Si falta info, haz 1 pregunta corta para poder ayudar mejor (por ejemplo: '¿Estás en Banco, Mundial o Beneficios?').",
  ].join('\n');

  const payload = {
    contents: messages,
    generationConfig: {
      temperature: 0.55,
      maxOutputTokens: 1024,
    },
    systemInstruction: {
      parts: [{
        text: CHATBOT_SYSTEM_INSTRUCTION,
      }],
    },
  };

  const data = await callGeminiAPI(payload, options);

  return data?.candidates?.[0]?.content?.parts
    ?.map((p) => p?.text)
    .filter(Boolean)
    .join('\n') || 'Lo siento, no pude procesar tu solicitud.';
}

export function getPrizeLibrary() {
  return PRIZE_LIBRARY;
}
