import { defineStore } from 'pinia';

const translations = {
  en: {
    // Landing
    hero_eyebrow: 'Elite Training Platform',
    hero_subtitle: 'The premium tracking platform for pull-up enthusiasts. Record reps, visualize progress, and dominate the rankings.',
    btn_start: 'Get Started',
    
    // Landing Leaderboard
    landing_lb_title: 'Hall of Fame',
    landing_lb_subtitle: 'Daily top performers in the global circuit.',

    feat_heatmap_title: 'Tactical Heatmap',
    feat_heatmap_desc: 'Visualize your training consistency with a professional GitHub-inspired contribution graph.',
    feat_leaderboard_title: 'Global Rankings',
    feat_leaderboard_desc: "Climb the ranks and see where you stand against the world's most elite pull-up athletes.",
    feat_social_title: 'Social Circles',
    feat_social_desc: 'Add friends, track their progress, and build your own inner circle of performance.',
    
    // Auth / Login
    login_title: 'Reppy',
    login_subtitle: 'The premium tracking platform for pull-up enthusiasts.',
    login_back: 'Back to Home',
    login_google: 'Sign in with Google',
    
    // Dashboard
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_social: 'Social',
    nav_inventory: 'Inventory',
    nav_armory: 'Armory',
    nav_gear: 'Gear',
    nav_profile: 'Profile',
    nav_go_dashboard: 'Go to Dashboard',

    stats_total: 'Total Reps',
    stats_goal: 'Daily Goal',
    stats_streak: 'Active Streak',
    stats_month: 'Top Month',
    stats_gains: 'Gains',
    stats_reps: 'Reps',
    stats_days: 'Days',
    activity_stream: 'Activity Stream',
    recent_logs: 'Recent Logs',
    table_date: 'Date',
    table_count: 'Count',
    table_empty: 'Nothing but gains to be logged...',
    log_pullups: 'Log Pull-ups',
    btn_add: 'Add',
    rankings: 'Rankings',
    sign_out: 'Sign Out',
    nav_shop: 'Goggins Shop',
    tf_shop: 'Shop',
    
    // Heatmap Tooltips & Labels
    heatmap_reps: 'reps on',
    heatmap_no_reps: 'No reps on',
    stats_settings: 'Settings',
    stats_less: 'Less',
    stats_more: 'More',
    stats_volume_metrics: 'Volume Metrics',
    stats_last_year: 'in the last year',
    stats_top_month: 'Top Month',
    heatmap_reps_last_30: 'Reps in the last 30 days',

    // Weekdays
    day_mon: 'Mon',
    day_tue: 'Tue',
    day_wed: 'Wed',
    day_thu: 'Thu',
    day_fri: 'Fri',
    day_sat: 'Sat',
    day_sun: 'Sun',


    
    // Social
    community: 'Community',
    community_subtitle: 'Connect with fellow legends and track their progress.',
    find_friends: 'Find Friends',
    search_placeholder: 'Search enthusiasts...',
    btn_add_friend: 'Add',
    no_results: 'No legends found matching your quest.',
    inner_circle: 'My Inner Circle',
    solo_journey: "You're on a solo journey.",
    solo_desc: 'Add friends to compete and stay motivated.',
    
    // Leaderboard
    lb_friends: 'Friends',
    lb_global: 'Global',
    lb_rank: 'Rank',
    lb_view_full: 'View Full Leaderboard',
    lb_empty: 'No legends found yet.',
    
    // Timeframes
    tf_today: 'Today',
    tf_week: 'Week',
    tf_month: 'Month',
    tf_year: 'Year',
    tf_all: 'All Time',
    
    // Privacy
    privacy_settings: 'Privacy Settings',
    private_profile: 'Private Profile',
    private_desc: 'Hide your profile from global rankings.',
    
    // Account Management
    login_btn: 'Sign In',
    signup_btn: 'Sign Up',
    have_account: 'Already have an account?',
    no_account: 'Need an account?',
    email: 'Email',
    password: 'Password',
    name_placeholder: 'Full Name',
    delete_account: 'Delete Account',
    delete_confirm_title: 'Unstoppable Deletion?',
    delete_confirm: 'Are you sure? This action is permanent.',
    change_avatar: 'Update Avatar',
    btn_delete: 'Delete Account',

    // Settings & Goals
    settings_title: 'Profile Settings',
    profile_name: 'Display Name',
    daily_goal: 'Daily Rep Goal',
    save_settings: 'Save Changes',
    settings_success: 'Profile Updated',
    stats_updated: 'Log Updated',
    goal_progress: 'Daily Progress',

    avatar_subtitle: 'Personalize your profile',
    delete_subtitle: 'Irreversible action',
    
    // Exercises
    pullups: 'Pull-ups',
    muscleups: 'Muscle Ups',
    dips: 'Dips',
    pushups: 'Push-ups',
    weighted_pullups: 'Weighted Pull-ups',
    
    // Auth Errors
    ERR_USER_EXISTS: 'This email is already registered. Please log in.',
    ERR_GOOGLE_ONLY: 'This account uses Google Login. Please use the Google button.',
    ERR_USER_NOT_FOUND: 'No account found with this email.',
    ERR_WRONG_PASSWORD: 'Incorrect password. Please try again.',
    ERR_SERVER: 'A system error occurred. Please try again later.',

    // Onboarding
    onboarding_title: 'Welcome to Reppy',
    onboarding_subtitle: 'The elite training protocol for athletes.',
    onboarding_mission_title: 'The Mission',
    onboarding_mission_desc: 'Log your reps and earn Reppy Coins (RC). Every set counts towards your progression and status in the global circuit.',
    onboarding_damage_title: 'Universal Impact',
    onboarding_damage_desc: 'Your reps deal damage to active Boss Anomalies. Defeat them with the community to unlock legendary loot.',
    onboarding_rewards_title: 'The Armory',
    onboarding_rewards_desc: 'Spend RC in the shop for exclusive titles, borders, and effects. Claim chests from fallen bosses to grow your collection.',
    onboarding_btn_next: 'Next Phase',
    onboarding_btn_back: 'Previous',
    onboarding_btn_finish: 'Begin Operation',
    
    // Categories
    cat_all: 'All Units',
    cat_title: 'Honor Titles',
    cat_border: 'Avatar Borders',
    cat_avatar: 'Avatars',
    cat_background: 'Interface Screens'
  },
  es: {
    // Landing
    hero_eyebrow: 'Plataforma de Entrenamiento de Élite',
    hero_subtitle: 'La plataforma premium para entusiastas de las dominadas. Registra repeticiones, visualiza tu progreso y domina los rankings.',
    btn_start: 'Comenzar Ahora',

    // Landing Leaderboard
    landing_lb_title: 'Muro de la Fama',
    landing_lb_subtitle: 'Los mejores del día en el circuito global.',

    feat_heatmap_title: 'Heatmap Táctico',
    feat_heatmap_desc: 'Visualiza la consistencia de tu entrenamiento con un gráfico de contribución profesional inspirado en GitHub.',
    feat_leaderboard_title: 'Rankings Globales',
    feat_leaderboard_desc: 'Sube en el ranking y mira dónde estás frente a los atletas de élite más destacados del mundo.',
    feat_social_title: 'Círculos Sociales',
    feat_social_desc: 'Añade amigos, sigue su progreso y construye tu propio círculo interno de alto rendimiento.',
    
    // Auth / Login
    login_title: 'Reppy',
    login_subtitle: 'La plataforma premium para entusiastas de las dominadas.',
    login_back: 'Volver al Inicio',
    login_google: 'Iniciar sesión con Google',
    
    // Dashboard
    nav_home: 'Inicio',
    nav_dashboard: 'Panel',
    nav_social: 'Social',
    nav_inventory: 'Inventario',
    nav_armory: 'Armería',
    nav_gear: 'Equipo',
    nav_profile: 'Perfil',
    nav_go_dashboard: 'Ir al Panel',

    stats_total: 'Reps Totales',
    stats_goal: 'Objetivo Diario',
    stats_streak: 'Racha Activa',
    stats_month: 'Mejor Mes',
    stats_gains: 'Gains',
    stats_reps: 'Reps',
    stats_days: 'Días',
    activity_stream: 'Flujo de Actividad',
    recent_logs: 'Registros Recientes',
    table_date: 'Fecha',
    table_count: 'Cantidad',
    table_empty: 'Nada más que ganancias por registrar...',
    log_pullups: 'Registrar Dominadas',
    btn_add: 'Añadir',
    rankings: 'Clasificaciones',
    sign_out: 'Cerrar Sesión',
    nav_shop: 'Tienda Goggins',
    tf_shop: 'Tienda',

    // Heatmap Tooltips & Labels
    heatmap_reps: 'reps el',
    heatmap_no_reps: 'Sin reps el',
    stats_settings: 'Ajustes',
    stats_less: 'Menos',
    stats_more: 'Más',
    stats_volume_metrics: 'Métricas de Volumen',
    stats_last_year: 'en el último año',
    stats_top_month: 'Mejor Mes',
    heatmap_reps_last_30: 'Reps en los últimos 30 días',
    
    // Weekdays
    day_mon: 'Lun',
    day_tue: 'Mar',
    day_wed: 'Mié',
    day_thu: 'Jue',
    day_fri: 'Vie',
    day_sat: 'Sáb',
    day_sun: 'Dom',


    
    // Social
    community: 'Comunidad',
    community_subtitle: 'Conecta con otros leyendas y sigue su progreso.',
    find_friends: 'Buscar Amigos',
    search_placeholder: 'Buscar entusiastas...',
    btn_add_friend: 'Añadir',
    no_results: 'No se encontraron leyendas que coincidan con tu búsqueda.',
    inner_circle: 'Mi Círculo Interno',
    solo_journey: 'Estás en un viaje en solitario.',
    solo_desc: 'Añade amigos para competir y mantenerte motivado.',
    
    // Leaderboard
    lb_friends: 'Amigos',
    lb_global: 'Global',
    lb_rank: 'Rango',
    lb_view_full: 'Ver Tabla Completa',
    lb_empty: 'Aún no hay leyendas.',

    // Timeframes
    tf_today: 'Hoy',
    tf_week: 'Semana',
    tf_month: 'Mes',
    tf_year: 'Año',
    tf_all: 'Total',

    // Privacy
    privacy_settings: 'Ajustes de Privacidad',
    private_profile: 'Perfil Privado',
    private_desc: 'Oculta tu perfil de los rankings globales.',

    // Account Management
    login_btn: 'Entrar',
    signup_btn: 'Registrarse',
    have_account: '¿Ya tienes una cuenta?',
    no_account: '¿No tienes cuenta?',
    email: 'Email',
    password: 'Contraseña',
    name_placeholder: 'Nombre y Apellidos',
    delete_account: 'Borrar Cuenta',
    delete_confirm_title: '¿Borrado Irreversible?',
    delete_confirm: '¿Estás seguro? Esta acción es permanente.',
    change_avatar: 'Actualizar Avatar',
    btn_delete: 'Borrar Cuenta',

    // Settings & Goals
    settings_title: 'Ajustes de Perfil',
    profile_name: 'Nombre de Usuario',
    daily_goal: 'Meta Diaria de Repeticiones',
    save_settings: 'Guardar Cambios',
    settings_success: 'Peril Actualizado',
    stats_updated: 'Registro Actualizado',
    goal_progress: 'Progreso Diario',

    avatar_subtitle: 'Personalize your perfil',
    delete_subtitle: 'Acción irreversible',

    // Ejercicios
    pullups: 'Dominadas',
    muscleups: 'Muscle Ups',
    dips: 'Fondos',
    pushups: 'Flexiones',
    weighted_pullups: 'Dominadas con Lastre',

    // Auth Errors
    ERR_USER_EXISTS: 'Este correo ya está registrado. Por favor, inicia sesión.',
    ERR_GOOGLE_ONLY: 'Esta cuenta usa Google. Por favor, usa el botón de Google.',
    ERR_USER_NOT_FOUND: 'No se encontró ninguna cuenta con este correo.',
    ERR_WRONG_PASSWORD: 'Contraseña incorrecta. Inténtalo de nuevo.',
    ERR_SERVER: 'Ocurrió un error del sistema. Reinténtalo más tarde.',

    // Onboarding
    onboarding_title: 'Bienvenido a Reppy',
    onboarding_subtitle: 'El protocolo de entrenamiento de élite.',
    onboarding_mission_title: 'La Misión',
    onboarding_mission_desc: 'Registra tus reps y gana Reppy Coins (RC). Cada serie cuenta para tu progreso y estatus en el circuito global.',
    onboarding_damage_title: 'Impacto Universal',
    onboarding_damage_desc: 'Tus repeticiones infligen daño a los Boss activos. Derrótalos con la comunidad para desbloquear botín legendario.',
    onboarding_rewards_title: 'La Armería',
    onboarding_rewards_desc: 'Gasta tus RC en la tienda en títulos, bordes y efectos exclusivos. Reclama cofres de bosses caídos para aumentar tu colección.',
    onboarding_btn_next: 'Siguiente Fase',
    onboarding_btn_back: 'Anterior',
    onboarding_btn_finish: 'Iniciar Operación',
    
    // Categorías
    cat_all: 'Todas las Unidades',
    cat_title: 'Títulos de Honor',
    cat_border: 'Marcos de Avatar',
    cat_avatar: 'Avatares',
    cat_background: 'Pantallas de Interfaz'
  }
};

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: localStorage.getItem('locale') || (navigator.language.startsWith('es') ? 'es' : 'en'),
  }),
  actions: {
    setLocale(newLocale) {
      if (translations[newLocale]) {
        this.locale = newLocale;
        localStorage.setItem('locale', newLocale);
      }
    },
    t(key) {
      return translations[this.locale][key] || key;
    }
  }
});
