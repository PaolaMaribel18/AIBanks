/**
 * Español — idioma base de la aplicación.
 * Toda string visible al usuario que NO provenga de un API externo o de la base
 * de datos debe vivir aquí.
 *
 * Convención de keys:
 *   seccion.subseccion.key
 *   Ejemplo: home.modal.transfer.title
 *
 * Interpolación:  {{variable}}
 *   Ejemplo: 'Hola, {{name}}'  →  t('topbar.hello', { name: 'Juan' })
 */
const es = {
  // ─── Common / Shared ──────────────────────────────────────────
  common: {
    loading: 'Cargando...',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    back: 'Atrás',
    next: 'Siguiente',
    close: 'Cerrar',
    understood: 'Entendido',
    continue: 'Continuar',
    save: 'Guardar',
    error: 'Error',
    processing: 'Procesando...',
    skipForNow: 'Omitir por ahora',
    poweredBy: 'powered by',
    mAIles: 'mAIles',
    points: 'pts',
    draw: 'Empate',
  },

  // ─── Top Bar ──────────────────────────────────────────────────
  topbar: {
    hello: 'Hola, {{name}}',
    tourLabel: 'Ver tour',
    themeToggle: 'Cambiar a tema {{theme}}',
    themeLight: 'claro',
    themeDark: 'oscuro',
  },

  // ─── Bottom Nav ───────────────────────────────────────────────
  bottomNav: {
    bank: 'Banco',
    worldCup: 'Mundial',
    rewards: 'Beneficios',
  },

  // ─── Splash Screen ────────────────────────────────────────────
  splash: {
    tapToStart: 'Toca para comenzar',
    subtitle: 'Disfruta del Mundial 2026',
    loadingExperience: 'Cargando tu experiencia...',
  },

  // ─── Login ────────────────────────────────────────────────────
  login: {
    title: 'Iniciar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    submit: 'Iniciar Sesión',
    noAccount: '¿No tienes cuenta?',
    register: 'Regístrate',
    mascotWelcome: 'Las mascotas oficiales te dan la bienvenida',
    errorDefault: 'Error al iniciar sesión',
  },

  // ─── Register ─────────────────────────────────────────────────
  register: {
    title: 'Registrarse',
    fullName: 'Nombre Completo',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    submit: 'Registrarse',
    hasAccount: '¿Ya tienes cuenta?',
    loginLink: 'Inicia Sesión',
    acceptTerms: 'Acepto los',
    termsAndConditions: 'Términos y Condiciones',
    acceptDataPolicy: 'Acepto el tratamiento de mis datos de acuerdo a la',
    dataProtectionLaw: 'Ley Orgánica de Protección de Datos Personales (Ecuador)',
    passwordsMismatch: 'Las contraseñas no coinciden',
    mustAcceptTerms: 'Debes aceptar los términos y la política de protección de datos',
    errorDefault: 'Error al registrarse',
    confirmEmail: 'Revisa tu correo y confirma tu cuenta antes de iniciar sesión.',
  },

  // ─── Auth Errors ──────────────────────────────────────────────
  auth: {
    otpExpired: 'El enlace del correo es inválido o ya expiró. Solicita uno nuevo para continuar.',
    accessDenied: 'No se pudo completar la validación del correo. Intenta nuevamente.',
    defaultError: 'Ocurrió un problema al autenticar tu cuenta.',
  },

  // ─── Home / Dashboard ─────────────────────────────────────────
  home: {
    greeting: 'Mis Finanzas',
    subtitle: 'AIBank Móvil',
    savingsAccount: 'Cuenta de Ahorros',
    creditCard: 'Tarjeta de Crédito',
    availableCredit: 'Cupo Disponible',
    transfer: 'Transferir',
    services: 'Servicios',
    cards: 'Tarjetas',
    myBank: 'Mi Banco',
    benefitsAndMissions: 'Beneficios y Misiones',
    exclusiveModule: 'MÓDULO EXCLUSIVO',
    worldCupSeason: 'Temporada Mundial 2026',
    availableMiles: 'Tienes {{miles}} mAIles disponibles.',
    missionComplete: '¡Misión Completada! +{{miles}} mAIles',

    // Transfer Modal
    modal: {
      transfer: {
        title: 'Nueva Transferencia',
        desc: 'Transfiere a otros usuarios de AIBank.',
        recent: 'Recientes',
        recipient: 'Destinatario',
        loadingUsers: 'Cargando usuarios...',
        selectRecipient: 'Selecciona un destinatario',
        amount: 'Monto ($)',
        confirmTitle: 'Confirmar Envío',
        recipientLabel: 'Destinatario:',
        amountLabel: 'Monto:',
        commission: 'Comisión:',
        confirmAndSend: 'Confirmar y Enviar',
        successTitle: '¡Transferencia Exitosa!',
        successDesc: '¡Felicidades! Has enviado ${{amount}} a {{name}}.',
        earnedMiles: 'Ganaste +{{miles}} mAIles',
        invalidAmount: 'Ingresa un monto válido mayor a 0.',
        insufficientBalance: 'Saldo insuficiente para completar la transferencia.',
        rpcMissing: 'Falta configurar la función de transferencia en Supabase (RPC transfer_balance).',
        transferError: 'Ocurrió un error al procesar la transferencia.',
        recipientsError: 'No se pudieron cargar los destinatarios.',
      },
      // Services Modal
      services: {
        title: 'Pago de Servicios',
        desc: 'Selecciona el servicio que deseas pagar.',
        electricity: 'Electricidad',
        water: 'Agua Potable',
        internet: 'Internet / Wifi',
        streaming: 'Streaming / TV',
        refNumber: 'Número de Suministro / Referencia',
        refPlaceholder: 'Ej. 123456789',
        estimatedAmount: 'Monto Estimado',
        payNow: 'Pagar Ahora',
        invoiceDesc: 'Ingresa el número de referencia de tu factura.',
        successTitle: '¡Pago Exitoso!',
        successDesc: 'Tu pago de {{service}} ha sido procesado correctamente.',
        earnedMiles: 'Ganaste +{{miles}} mAIles',
      },
      // Cards Modal
      cards: {
        title: 'Gestión de Tarjetas',
        desc: 'Seguridad y datos de tu Tarjeta de Crédito AIBank.',
        expires: 'VENCE',
        showData: 'Ver datos',
        hideData: 'Ocultar',
        freeze: 'Congelar',
        unfreeze: 'Desbloquear',
        frozen: 'Tarjeta Congelada',
        recentActivity: 'Actividad Reciente',
        today: 'Hoy',
        yesterday: 'Ayer',
      },
      // Banking Hub
      hub: {
        title: 'Mi Banco AIBank',
        desc: 'Tu centro de relación y beneficios exclusivos.',
        clientLevel: 'Nivel de Cliente',
        branches: 'Sucursales',
        nearYou: 'Cercanas a ti',
        humanSupport: 'Hablar con Soporte Humano',
      },
      // Feature Announcement
      feature: {
        title: 'Temporada Mundial con IA',
        desc: 'Nuestra campaña de temporada ya está aquí, ahora impulsada por Inteligencia Artificial.',
        descDetail: 'Obtén predicciones exclusivas, desafía los pronósticos y gana mAIles canjeables.',
        playNow: 'Jugar Ahora',
      },
      // Card Activation
      activation: {
        title: 'Activa tu Tarjeta Digital',
        desc: 'Disfruta de beneficios exclusivos al activar tu tarjeta Platinum hoy.',
        benefit1: '0% de comisión en todas tus compras online de temporada.',
        benefit2: 'Ganancia masiva de mAIles por tus predicciones del Mundial.',
        benefit3: 'Protección IA activa contra cualquier intento de fraude.',
        termsNotice: 'Al activar, aceptas el contrato de emisión de tarjeta digital AIBank v1.02.',
        acceptAndActivate: 'Aceptar y Activar',
        maybeLater: 'Quizás más tarde',
        successTitle: '¡Tarjeta Activada!',
        successDesc: '¡Felicidades! Disfruta de tu nueva tarjeta Platinum.',
        successMiles: 'Has ganado +{{miles}} mAIles.',
        newBenefits: 'Nuevos Beneficios Disponibles',
      },
    },

    // Loyalty Missions
    missions: {
      digitalCard: 'Tarjeta Digital AIBank',
      digitalCardDesc: 'Activa tu tarjeta digital y úsala en tus compras online.',
      manage: 'Gestionar',
      activate: 'Activar',
      savingsAccount: 'Cuenta Ahorro AIBank',
      savingsAccountDesc: 'Inicia un plan de ahorro Mundial en tu Cuenta Ahorro.',
      save: 'Ahorrar',
      qrPay: 'Paga con QR AIBank',
      qrPayDesc: 'Escanea y paga en comercios con QR AIBank.',
      scan: 'Escanear',
      payroll: 'Nómina AIBank',
      payrollDesc: 'Recibe tu sueldo en AIBank y recibe un bono VIP.',
      link: 'Vincular',
      exclusive: 'EXCLUSIVO',
    },
  },

  // ─── Profile ──────────────────────────────────────────────────
  profile: {
    title: 'Mi AIBank ID',
    subtitle: 'Gestiona tus credenciales y actividad.',
    effectiveness: 'Efectividad',
    globalRanking: 'Ranking Global',
    days: 'Días',
    bestStreak: 'Tu mejor racha de pronósticos',
    achievements: '🏅 Logros',
    archetype: '🎯 Tu Arquetipo',
    archetypes: {
      practico: 'Práctico',
      acumulador: 'Acumulador',
      competidor: 'Competidor',
      practicoDesc: 'Prefieres utilidad inmediata, canje rápido y beneficios claros.',
      acumuladorDesc: 'Prefieres progreso, metas y premios de mayor valor por acumulación.',
      competidorDesc: 'Prefieres reconocimiento, posición y premios aspiracionales.',
    },
    predictionHistory: '📋 Historial de Predicciones',
    yourPrediction: 'Tu predicción:',
    noPredictions: 'Aún no has hecho predicciones.',
    appTheme: 'Tema de la app',
    themeDark: 'Oscuro',
    themeLight: 'Claro',
    language: 'Idioma',
    about: 'Acerca de',
    logout: 'Cerrar Sesión',
    referral: {
      sectionTitle: '🎁 Tu Código de Referido',
      subtitle: 'Compártelo y ambos ganan mAIles',
      rewardOwnerSuffix: 'cuando alguien use tu código',
      copyBtn: 'Copiar',
      copied: '¡Copiado!',
      usedBadge: 'Código usado',
      enterCode: 'Ingresar código de referido',
      hasUsed: 'Ya usaste un código',
      modalTitle: 'Código de Referido',
      modalSubtitle: 'Ingresa el código de un amigo y ambos ganan mAIles',
      rewardGiver: 'mAIles para ti',
      rewardForFriend: 'mAIles para tu amigo',
      inputPlaceholder: 'Ej: AB12CD34',
      applyBtn: 'Aplicar código',
      applying: 'Aplicando...',
      successTitle: '¡Código aplicado! 🎉',
      successDesc: '+{{points}} mAIles fueron añadidos a tu cuenta. ¡Tu amigo también recibió su recompensa!',
      close: 'Cerrar',
      errorAlreadyUsed: 'Ya usaste un código de referido anteriormente.',
      errorOwnCode: 'No puedes usar tu propio código de referido.',
      errorNotFound: 'Código no encontrado. Verifica e intenta de nuevo.',
      errorGeneral: 'Error al aplicar el código. Intenta de nuevo.',
    },
    aboutModal: {
      title: 'Acerca de AI Banks',
      appName: 'AI Banks Ecuador',
      version: 'Versión 1.0.0',
      whatIs: '¿Qué es AI Banks?',
      whatIsDesc: 'Una plataforma de predicciones deportivas impulsada por inteligencia artificial para el Mundial FIFA 2026. Acumula puntos, sube de nivel y gana premios.',
      technology: 'Tecnología',
      technologyDesc: 'Construida con React, Vite, Supabase y modelos de machine learning para predicciones inteligentes.',
      developedBy: 'Desarrollado por',
      developedByDesc: 'Equipo AI Banks — powered by Tata Consultancy Services (TCS).',
      contact: 'Contacto',
      contactDesc: '¿Preguntas o sugerencias? Escríbenos a soporte@aibanks.ec',
    },
  },

  // ─── Language Selector ────────────────────────────────────────
  languageSelector: {
    title: 'Seleccionar Idioma',
    subtitle: 'Selecciona tu idioma preferido',
    es: 'Español',
    en: 'English',
  },

  // ─── Rewards ──────────────────────────────────────────────────
  rewards: {
    title: 'Beneficios AIBank',
    subtitle: 'Canjea tus mAiles por recompensas y mejoras financieras.',
    capitalLabel: 'Tu capital en mAiles',
    viewRanking: 'Ver Ranking Global',
    compareStreak: 'Compara tu racha y puntaje',
    recommendedForYou: 'Recomendados exclusivamente para ti',
    redeemNow: 'Canjear Ahora',
    redeem: 'Canjear',
    redeemed: 'Canjeado',
    missing: 'Faltan {{amount}}',
    missingMiles: 'Faltan {{amount}} mAiles',
    approved: '¡Aprobado!',
    popular: 'Popular',
    catalog_title: 'Catálogo',

    categories: {
      all: 'Todos',
      financial: 'Finanzas',
      cashback: 'Cashback',
      merchandise: 'Merch',
      entertainment: 'Entreteni.',
      experiences: 'Experiencias',
    },

    ai: {
      recommendationTitle: 'Recomendación para ti',
      recommendationWithAI: 'Recomendación con IA',
      teaser: '¿Quieres descubrir lo que nuestro AI-Agent preparó para ti? Revisa nuestros beneficios.',
      analyzeRewards: 'Analizar premios',
      analyzing: 'Analizando tus beneficios…',
      readingProfile: 'Leyendo tu perfil',
      comparingBenefits: 'Comparando beneficios disponibles',
      personalizing: 'Personalizando recomendaciones',
      detectedProfile: 'Perfil detectado:',
      readyMessage: 'Listo. Ya personalizamos tus beneficios.',
    },

    onboarding: {
      title: 'Tu Identidad AIBank 🌟',
      subtitle: 'Queremos armar un portafolio de beneficios ideal para ti. (Paso {{step}} de {{total}})',
      q1: '¿Qué te motiva más a participar en los beneficios?',
      q1opt1: 'Beneficios financieros a largo plazo',
      q1opt2: 'Premios de alta gama y tecnología',
      q1opt3: 'Ganar algo práctico y de uso diario',
      q2: 'Cuando usas tu banco, ¿qué te gusta más?',
      q2opt1: 'Reducir tasas o ahorrar en mi crédito',
      q2opt2: 'Tener estatus VIP y los mejores seguros',
      q2opt3: 'Cashback directo por mis compras',
      q3: 'Si tuvieras 5000 mAiles, ¿qué harías?',
      q3opt1: 'Rebajar mi porcentaje de préstamo',
      q3opt2: 'Canjear la consola del momento',
      q3opt3: 'Canjear múltiples gift cards útiles',
    },

    archetypeExplanations: {
      competidor: 'Prefieres el reconocimiento, posición VIP y grandes premios aspiracionales (Tecnología y Exclusividad).',
      acumulador: 'Prefieres metas claras y beneficios financieros profundos (-Tasa, Hipoteca, Ahorro).',
      practico: 'Prefieres el beneficio inmediato que uses diariamente (Cashback, Supermercados, Cero Mantenimiento).',
    },

    // Reward catalog names & descriptions
    catalog: {
      'comp-worldcup-trip': { name: 'Viaje al Mundial 2026', description: 'Vive el Mundial 2026 desde el estadio: viaje + experiencia completa.' },
      'comp-vip-tickets': { name: 'Entradas VIP para un partido del Mundial', description: 'Acceso VIP para sentir el Mundial como un verdadero campeón.' },
      'comp-limited-jersey': { name: 'Camiseta oficial edición limitada de selección', description: 'Edición limitada para hinchas que juegan por lo grande.' },
      'comp-card-upgrade': { name: 'Upgrade de categoría de tarjeta o beneficios premium del banco', description: 'Más beneficios premium para que tu experiencia sea de élite.' },
      'comp-ps5': { name: 'PlayStation 5', description: 'Sube tu nivel: una PS5 puede ser tu próximo gran canje.' },
      'acc-miles-bonus': { name: 'Bono alto de millas', description: 'Acumula y canjea: un impulso grande para tus próximos viajes.' },
      'acc-high-cashback': { name: 'Cashback acumulado de alto valor', description: 'Convierte tu constancia en un cashback de alto impacto.' },
      'acc-premium-suitcase': { name: 'Maleta de viaje premium', description: 'Lista para despegar: calidad premium para tus próximas metas.' },
      'acc-mid-phone': { name: 'Celular gama media', description: 'Un upgrade práctico para tu día a día, a punta de puntos.' },
      'acc-premium-headphones': { name: 'Audífonos inalámbricos premium', description: 'Audio premium para acompañar tu racha de predicciones.' },
      'prac-instant-cashback': { name: 'Cashback inmediato a la cuenta', description: 'Beneficio directo: canje rápido y sin complicaciones.' },
      'prac-gift-card': { name: 'Gift card de supermercado o retail', description: 'Ahorro real para compras del día a día.' },
      'prac-discounts': { name: 'Descuentos en comercios aliados', description: 'Descuentos listos para usar en tus marcas aliadas.' },
      'prac-speaker': { name: 'Parlante portátil', description: 'Música a donde vayas: canje rápido, disfrute inmediato.' },
      'prac-power-bank': { name: 'Power bank', description: 'Energía extra para tu rutina: práctico y útil.' },
    },
  },

  // ─── Predictions ──────────────────────────────────────────────
  predictions: {
    title: '🎯 Predicciones',
    subtitle: 'Elige el ganador y acumula puntos',
    all: 'Todos',
    predicted: 'Pronosticados',
    allEmoji: '🌎 Todos',
    predictedEmoji: '✅ Pronosticados',
    group: 'Grupo {{group}}',
    predictionsLabel: 'Predicciones',
    matchesLabel: 'Partidos',
    ptsInPlay: 'Pts en Juego',
    loadingMatches: 'Cargando partidos de la FIFA... ⚽',
    loadError: 'Error al cargar:',
    noPredictions: 'Aún no has enviado pronósticos.',
    noMatchesPending: 'No hay partidos pendientes en esta sección.',
  },

  // ─── World Cup Season ─────────────────────────────────────────
  season: {
    balanceLabel: 'Mis mAIles Temporada Mundial',
    showHideBalance: 'Mostrar/ocultar saldo',
    byPredictions: '+{{amount}} por predicciones',
    streak: 'Racha {{count}}',
    tabs: {
      challenges: 'Desafios',
      predictions: 'Pronosticos',
      live: 'En Vivo',
    },
    dailyBonus: 'BONO DIARIO',
    dailyBonusValue: '+50 mAIles gratis',
    claimed: 'Reclamado',
    claim: 'Reclamar',
    howToEarn: '¿Cómo ganar más mAIles?',
    howToEarnDesc: 'Nuestra IA analiza los datos para predecir al favorito de cada partido. Al consultar a AI-Gents, obtendrás ganancias conservadoras o te llevarás una recompensa masiva según el riesgo.',
    matchesForYou: 'Partidos para ti 🔥',
    seeAll: 'Ver todos',
    loadingMatches: 'Cargando partidos... ⚽',
    allCompleted: 'Ya completaste todos los partidos recientes.',
    myPortfolio: 'Mi Portafolio',
    chose: 'Elegiste:',
    noPredictions: 'Aún no has guardado predicciones.',
    goToChallenges: '¡Ve a Desafíos!',

    // Season Announcement Modal
    announcement: {
      title: '¡Temporada Mundial IA Activa!',
      desc: 'Bienvenido al centro de predicciones. Usa tus mAIles para desafiar a la IA, completa desafíos diarios y escala en el ranking global.',
      bonusWaiting: '¡Tu bono diario de 50 mAIles te espera!',
      startChallenge: 'Empezar Desafío',
    },
  },

  // ─── Questionnaire ────────────────────────────────────────────
  questionnaire: {
    title: 'Personaliza tus recomendaciones',
    questionOf: 'Pregunta {{current}} de {{total}}',
    q1: '¿Qué te motiva más a participar en los pronósticos?',
    q1opt1: 'Quedar arriba entre los participantes',
    q1opt2: 'Sumar puntos y acercarme a una meta grande',
    q1opt3: 'Ganar algo útil de forma rápida',
    q2: 'Cuando vuelves a una app como esta, ¿qué te anima más?',
    q2opt1: 'Ver cómo voy frente a otros',
    q2opt2: 'Ver que mis puntos siguen creciendo',
    q2opt3: 'Encontrar un beneficio claro y fácil de usar',
    q3: 'Si entras hoy a la app, ¿qué te gustaría revisar primero?',
    q3opt1: 'Mi posición actual',
    q3opt2: 'Mis puntos acumulados',
    q3opt3: 'Qué premio o beneficio puedo obtener hoy',
    analyzingProfile: 'Analizando tu perfil con IA…',
    geminiConfigured: 'Generando recomendaciones personalizadas con Gemini.',
    geminiNotConfigured: 'No detectamos API Key de Gemini. Usaremos una recomendación estándar.',
    profileReady: '¡Perfil IA listo!',
    archetypeLabel: 'Arquetipo AIBank',
    discoverBenefits: '¿Quieres descubrir los beneficios exclusivos que nuestro AI-Agent preparó para tu perfil?',
    seeBenefits: 'Ver beneficios',
    goToBank: 'Ir al Banco',
    closeAndGoBank: 'Cerrar e ir al banco',
  },

  // ─── Match Card ───────────────────────────────────────────────
  matchCard: {
    group: 'Grupo {{group}}',
    consultAI: 'Consultar a AI-Gents',
    aiAnalyzing: 'AI-Gents está analizando el partido, espera...',
    ptsEntry: '300 pts entrada',
    confirm: 'Confirmar',
    predictionSent: 'Predicción enviada',
  },

  // ─── Chatbot ──────────────────────────────────────────────────
  chatbot: {
    greeting: '¡Hola! Soy AI-AGENT, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
    online: 'En línea',
    placeholder: 'Escribe un mensaje...',
    errorMessage: 'Ups, parece que tengo un problema de conexión. Inténtalo de nuevo más tarde.',
    tooltipHello: '¡Hola!',
  },

  // ─── Joyride / Tour ───────────────────────────────────────────
  tour: {
    back: 'Atrás',
    close: 'Cerrar',
    last: 'Finalizar',
    next: 'Siguiente',
    skip: 'Saltar tour',
    global: {
      step1: 'Bienvenido a tu Banco. Aquí puedes gestionar tus cuentas, realizar transferencias y pagar tus servicios con facilidad.',
      step2: '¡Vive la emoción del Mundial! Participa en desafíos diarios, realiza tus pronósticos impulsados por IA y gana mAIles extra.',
      step3: 'Explora tus Beneficios. Canjea tus mAIles acumulados por premios exclusivos y experiencias VIP.',
    },
    season: {
      step1: 'Aquí verás tus mAIles exclusivos para la temporada del Mundial. ¡Úsalos para predecir y ganar!',
      step2: 'Cambia entre Desafíos (para ganar mAIles), Pronósticos (ver tus jugadas) y En Vivo (resultados reales).',
      step3: '¡No olvides reclamar tu bono diario! Te otorgamos 50 mAIles gratis cada día para que no dejes de jugar.',
      step4: 'Estos son los partidos destacados. Haz clic para elegir quién ganará y multiplica tus mAIles con nuestra IA.',
    },
  },

  // ─── Notifications ────────────────────────────────────────────
  notifications: {
    transferReceived: 'Transferencia Recibida',
    sentYou: '{{name}} te envió ${{amount}}',
    closeNotification: 'Cerrar notificación',
  },

  // ─── Leaderboard ──────────────────────────────────────────────
  leaderboard: {
    title: 'Ranking AIBank',
    subtitle: 'Compite con tus amigos y otros clientes de AIBank.',
    tabs: {
      weekly: 'Semanal',
      monthly: 'Mensual',
      global: 'Global',
    },
    you: 'Tú ({{name}})',
    streakLabel: 'Racha:',
  },

  // ─── FIFA Live ────────────────────────────────────────────────
  fifaLive: {
    title: 'FIFA World Cup 2026',
    live: 'EN VIVO',
    worldCupStarted: '¡El Mundial ha comenzado!',
    countdown: 'Faltan para {{match}}',
    liveNow: '🏟️ EN VIVO AHORA',
    days: 'Días',
    hours: 'Horas',
    min: 'Min',
    sec: 'Seg',
    ecuadorSchedule: 'Calendario Ecuador 🇪🇨',
    featuredMatches: 'Partidos Destacados',
    groupTable: 'Tabla de Grupos',
    groupLabel: 'Grupo {{group}}',
    tableHeaders: {
      pos: 'Pos',
      team: 'Selección',
      played: 'PJ',
      won: 'PG',
      drawn: 'PE',
      lost: 'PP',
      goalDiff: 'DG',
      pts: 'Pts',
    },
    source: 'Fuente:',
    connectionError: 'Error de Conexión FIFA API',
    checkScript: 'Revisa que el script de Vite esté corriendo y recarga la página.',
    connecting: 'Conectando con servidores de la FIFA...',
    openMatchCentre: 'Abrir FIFA Match Centre',
    now: 'ahora',
    minutesAgo: 'hace {{count}} min',
    hoursAgo: 'hace {{count}}h',
  },
};

export default es;
