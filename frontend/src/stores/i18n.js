import { defineStore } from 'pinia';

const translations = {
  en: {
    // Landing
    hero_eyebrow: 'Elite Protocol 2.0',
    hero_subtitle: 'The tactical tracking platform for pull-up masters. Record reps, visualize gains, and dominate the rankings.',
    btn_start: 'Initialize Protocol',
    
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
    login_subtitle: 'The elite tracking protocol for pull-up masters.',
    login_back: 'Back to HQ',
    login_google: 'Sign in with Google',
    
    // Dashboard
    nav_dashboard: 'Dashboard',
    nav_social: 'Social',
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
    have_account: 'Already have a protocol?',
    no_account: 'Need a new protocol?',
    email: 'Email',
    password: 'Password',
    name_placeholder: 'Full Name',
    delete_account: 'Destroy Protocol',
    delete_confirm: 'Are you sure? This is permanent.',
    change_avatar: 'Update Avatar',
    btn_delete: 'Delete Forever',

    // Settings & Goals
    settings_title: 'Protocol Settings',
    profile_name: 'Hero Name',
    daily_goal: 'Daily Rep Goal',
    save_settings: 'Update Protocol',
    settings_success: 'Profile Synchronized',
    goal_progress: 'Mission Progress',
    
    // Auth Errors
    ERR_USER_EXISTS: 'This email is already registered. Please log in.',
    ERR_GOOGLE_ONLY: 'This account uses Google Login. Please use the Google button.',
    ERR_USER_NOT_FOUND: 'No account found with this email.',
    ERR_WRONG_PASSWORD: 'Incorrect password. Please try again.',
    ERR_SERVER: 'A system error occurred. Please try again later.'
  },
  es: {
    // Landing
    hero_eyebrow: 'Protocolo de Elite 2.0',
    hero_subtitle: 'La plataforma táctica para maestros de las dominadas. Registra repeticiones, visualiza tus ganancias y domina los rankings.',
    btn_start: 'Inicializar Protocolo',

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
    login_subtitle: 'El protocolo de seguimiento de élite para maestros de las dominadas.',
    login_back: 'Volver al CG',
    login_google: 'Iniciar sesión con Google',
    
    // Dashboard
    nav_dashboard: 'Panel',
    nav_social: 'Social',
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
    have_account: '¿Ya tienes un protocolo?',
    no_account: '¿Necesitas un protocolo?',
    email: 'Email',
    password: 'Contraseña',
    name_placeholder: 'Nombre y Apellidos',
    delete_account: 'Destruir Protocolo',
    delete_confirm: '¿Estás seguro? Esto es permanente.',
    change_avatar: 'Actualizar Avatar',
    btn_delete: 'Borrar para siempre',

    // Settings & Goals
    settings_title: 'Ajustes del Protocolo',
    profile_name: 'Nombre del Héroe',
    daily_goal: 'Meta Diaria de Repeticiones',
    save_settings: 'Actualizar Protocolo',
    settings_success: 'Perfil Sincronizado',
    goal_progress: 'Progreso de Misión',

    // Auth Errors
    ERR_USER_EXISTS: 'Este correo ya está registrado. Por favor, inicia sesión.',
    ERR_GOOGLE_ONLY: 'Esta cuenta usa Google. Por favor, usa el botón de Google.',
    ERR_USER_NOT_FOUND: 'No se encontró ninguna cuenta con este correo.',
    ERR_WRONG_PASSWORD: 'Contraseña incorrecta. Inténtalo de nuevo.',
    ERR_SERVER: 'Ocurrió un error del sistema. Reinténtalo más tarde.'
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
