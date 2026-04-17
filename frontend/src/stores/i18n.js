import { defineStore } from 'pinia';

const translations = {
  en: {
    // Landing
    landing_title: 'Elite Training Platform',
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
    
    // Statistics Section
    stats_effort: 'Total Effort',
    stats_tonnage: 'Tonnage Moved',
    stats_consistency: 'Consistency Streak',
    stats_protocol_goal: 'Protocol Goal',
    stats_per_day: 'PER DAY',
    stats_total_reps: 'TOTAL REPS',
    
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
    onboarding_damage_desc: 'Your reps deal damage to active Boss Anomalies. 1 Rep = 1 Base Damage, multiplied by your STR level. Defeat them together!',
    onboarding_rewards_title: 'The Armory',
    onboarding_rewards_desc: 'Spend RC in the shop for exclusive titles, borders, and effects. Claim chests from fallen bosses to grow your collection.',
    onboarding_social_title: 'Neural Connection',
    onboarding_social_desc: "The social feed is now active. View your friends' workout logs, give likes, and leave comments to boost community morale.",
    onboarding_btn_next: 'Next Phase',
    onboarding_btn_back: 'Previous',
    onboarding_btn_finish: 'Begin Operation',
    
    // Categories
    cat_all: 'All Units',
    cat_title: 'Honor Titles',
    cat_border: 'Avatar Borders',
    cat_avatar: 'Avatars',
    cat_avatar: 'Avatars',
    cat_background: 'Interface Screens',
    cat_bundle: 'Welcome Packs',

    // Exercise Mastery
    exercise_mastery: 'Exercise Mastery',
    exercise_mastery_desc: 'HISTORICAL REPOSITORY OF EFFORT BY EXERCISE',

    // Codex
    codex_title: 'THE CODEX',
    codex_subtitle: 'RPG EVOLUTION GUIDE',
    codex_next_lv: 'NEXT LEVEL: +100 XP POINTS REQUIRED',
    codex_lv_up: 'Level Up:',

    codex_str_name: 'STRENGTH',
    codex_str_quote: 'Pure destructive power.',
    codex_str_desc: 'Measures your total strength. Increases when you add extra weight to your exercises (e.g., weighted workouts).',
    codex_str_action: 'Add extra weight to improve.',

    codex_pwr_name: 'POWER',
    codex_pwr_quote: 'Explosive critical impact.',
    codex_pwr_desc: 'Measures your peak effort in a single set. Increases by pushing your body to the limit in intensity.',
    codex_pwr_action: 'Do harder variations or max sets.',

    codex_end_name: 'ENDURANCE',
    codex_end_quote: 'Your energy tank.',
    codex_end_desc: 'Measures your overall stamina. Increases by accumulating a high number of repetitions throughout the day.',
    codex_end_action: 'Accumulate more daily reps.',

    codex_agi_name: 'AGILITY',
    codex_agi_quote: 'Unshakable determination.',
    codex_agi_desc: 'Measures your discipline. Increases by keeping a streak of active days and diversifying your routine.',
    codex_agi_action: 'Keep your daily streak alive.',

    // Shop Categories
    shop_tab_titles: 'TITLES',
    shop_tab_borders: 'BORDERS',
    shop_tab_avatars: 'AVATARS',
    shop_tab_backgrounds: 'EFFECTS',
    shop_tab_post_backgrounds: 'POSTS',
    shop_bundles_title: 'ELITE PROTOCOL BUNDLES',

    // Post Backgrounds
    'post-bg-carbon_name': 'Carbon Scan',
    'post-bg-carbon_desc': 'Dark carbon texture with laser scanning line.',
    'post-bg-neon_name': 'Neon Pulse',
    'post-bg-neon_desc': 'Neon border with vibrant reactive pulse.',
    'post-bg-matrix_name': 'Matrix Rain',
    'post-bg-matrix_desc': 'Digital code rain optimized for your wall.',
    'post-bg-inferno_name': 'Inferno Core',
    'post-bg-inferno_desc': 'Extreme heat with embers and thermal distortion.',
    'post-bg-void_name': 'Void Gravity',
    'post-bg-void_desc': 'Point of no return with gravitational distortion.',

    // New SEO Sections
    latest_protocols: 'LATEST PROTOCOLS',
    news_subtitle: 'Training updates, calisthenics guides, and community news.',
    view_all_articles: 'View all articles',
    trending: 'Trending',
    read_time: 'min read',
    related_protocols: 'Related Protocols',
    share_knowledge: 'Share this knowledge',
    copy_link: 'Copy link',
    share_x: 'Share on X',
    share_fb: 'Share on Facebook',
    share_li: 'Share on LinkedIn',
    share_wa: 'Share on WhatsApp',
    back_to_home: 'Back to Home',
    start_free: 'START FREE',

    // Exercise SEO Cards
    exercise_king: 'Exercise King',
    push_power: 'Push Power',
    full_ecosystem: 'Full Ecosystem',
    pullup_guide_title: 'How to do your first pull-up: Master Guide',
    pullup_guide_desc: 'Progression protocols from zero to mastering the bar.',
    gamification_title: 'Gamification & Calisthenics: Why Reppy Works',
    gamification_desc: 'The science behind XP points and motivation in fitness.',
    pullup_seo_title: 'Online Pull-up Counter',
    pullup_seo_desc: 'Log your pull-ups and compete in the global ranking.',
    pushup_seo_title: 'Free Push-up Counter',
    pushup_seo_desc: 'Keep track of your push-ups and level up your attributes.',
    rpg_protocol_title: 'Explore RPG Protocols',
    rpg_protocol_desc: 'Discover all of Reppy\'s gamification features.',

    // Exercise Landing - Pull-ups
    el_pullup_eyebrow: 'Free Pull-up App',
    el_pullup_h1: 'Online Pull-up Counter with RPG Progression',
    el_pullup_subtext: 'Log your pull-ups, visualize consistency with heatmaps, and compete in the global calisthenics ranking.',
    el_pullup_card_label: 'PULL-UP STAT',
    el_pullup_card_title: 'Monthly Volume',
    el_pullup_section1_h2: 'What is a pull-up counter for?',
    el_pullup_section1_body: '<p>Having an exact record of how many pull-ups you do each day is the only real way to ensure <strong>progressive overload</strong>. Our automatic counter doesn\'t just save the number; it assigns it to your Strength and Power attributes.</p><p>Forget about mobile notes. With Reppy, you have a GitHub-style visual history that motivates you to leave no blank spots.</p>',
    el_pullup_section2_h2: 'How to improve your pull-ups',
    el_pullup_tip1_title: 'Weekly Volume',
    el_pullup_tip1_body: 'Don\'t just look for a max in one set. Track the total weekly volume and try to increase it by 5% each month.',
    el_pullup_tip2_title: 'Grip Variety',
    el_pullup_tip2_body: 'Combine prone, supine, and neutral pull-ups. Reppy counts them all equally for your level progression.',
    el_pullup_tip3_title: 'Consistency Over Intensity',
    el_pullup_tip3_body: 'It\'s better to do 50 pull-ups 5 days a week than one single day of 200. The heatmap will help you see it.',
    el_pullup_guide_h2: 'Complete Guide to Perfect Pull-ups',
    el_pullup_article: `
      <h3>The importance of tracking in calisthenics</h3>
      <p>Many calisthenics athletes plateau because they don't know exactly how much volume they are handling. A serious <strong>pull-up counter</strong> is the first step out of stagnation. By logging every set, you can observe trends, detect overtraining, or realize you're not training frequently enough.</p>
      
      <h3>Technique and Quality</h3>
      <p>Doing a pull-up isn't just about getting your chin over the bar. It's about scapular control, avoiding kipping, and completing the range of motion. At Reppy, we encourage quality. Every rep you add to the counter should be a "clean" rep.</p>
      
      <h3>Why choose Reppy for your pull-ups?</h3>
      <p>Unlike other generic fitness apps, Reppy is designed by and for <strong>street workout</strong> practitioners. We understand that bodyweight progress is slow but very rewarding. That's why we've gamified the experience: every workout contributes to your global level, allowing you to unlock cosmetics and compete with other athletes worldwide.</p>
    `,

    // Exercise Landing - Push-ups
    el_pushup_eyebrow: 'Free Push-up App',
    el_pushup_h1: 'Online Push-up Counter and Progress Tracker',
    el_pushup_subtext: 'Keep track of your push-ups, level up your attributes, and maintain peak performance with advanced analytics.',
    el_pushup_card_label: 'PUSH-UP STAT',
    el_pushup_card_title: 'Total Endurance',
    el_pushup_section1_h2: 'Why use a push-up counter?',
    el_pushup_section1_body: '<p>Push-ups are the foundation of any push routine. Without a <strong>push-up counter</strong>, it\'s easy to lose count in high-volume sets or "lie" to yourself about real progress.</p><p>Logging your sets allows you to see if you\'re improving in endurance or if you need to move to harder variations to keep gaining strength.</p>',
    el_pushup_section2_h2: 'How to do more push-ups',
    el_pushup_tip1_title: 'High Frequency',
    el_pushup_tip1_body: 'Being an exercise with less relative weight, you can train it more frequently. Reppy helps you maintain the daily streak.',
    el_pushup_tip2_title: 'Push Variations',
    el_pushup_tip2_body: 'Log anything from diamond push-ups to one-arm push-ups. All contribute to your Strength (STR) attribute.',
    el_pushup_tip3_title: 'Core Control',
    el_pushup_tip3_body: 'A push-up is a moving plank. Don\'t forget to keep your core tight to protect your back.',
    el_pushup_guide_h2: 'Master Guide to Push-ups and Variations',
    el_pushup_article: `
      <h3>From beginner to expert</h3>
      <p>Anyone can start using a <strong>push-up counter</strong>. If you can\'t do a standard push-up, log your inclines. The goal is for the number on your dashboard to go up day after day. Progression is the heart of calisthenics.</p>
      
      <h3>Gamified training</h3>
      <p>Imagine every push-up is a hit to an enemy in an RPG. That\'s Reppy\'s philosophy. By turning physical effort into digital experience (XP) and coins, we reduce the mental friction of starting a workout. It\'s no longer "I have to train," it\'s "I have to level up."</p>
    `,
    el_cta_h2: 'Ready to start counting?',
    el_cta_btn: 'CREATE ACCOUNT NOW',
    el_cta_footer: '100% FREE · NO CARDS · PURE CALISTHENICS',
    el_back_home: 'Back to Reppy Home',
    el_latest_blog: 'Latest from Blog: David Goggins Routine',
    
    // Blog List & 404
    blog_list_title: 'Protocols & Training News',
    blog_list_subtitle: 'The latest calisthenics guides, mental protocols, and Reppy community updates.',
    pagination_next: 'Next Page',
    pagination_prev: 'Previous Page',
    not_found_title: 'AREA RESTRICTED (404)',
    not_found_desc: 'The protocol you are looking for has been moved or deleted from the mainframe.',
    not_found_btn: 'RETURN TO SAFE ZONE',

    // Battle Overhaul Modal
    battle_overhaul_title: 'BATTLE PROTOCOL OVERHAUL',
    battle_overhaul_subtitle: 'ENHANCED RPG DAMAGE SYSTEM ACTIVE',
    battle_overhaul_str_desc: 'Increase base damage and physical impact.',
    battle_overhaul_pwr_desc: 'Increase Critical Damage and magical energy.',
    battle_overhaul_agi_desc: 'Increase the random chance of Critical Hits.',
    battle_overhaul_summary: 'Your RPG stats (STR, PWR, AGI) and Global Level now combine to calculate massive damage. High levels can deal 100+ damage per rep!',
    battle_overhaul_boss_hint: 'Bosses have been strengthened to match your new power.',
    battle_overhaul_btn: 'ENGAGE BATTLE',
    stat_str: 'STRENGTH',
    stat_pwr: 'POWER',
    stat_agi: 'AGILITY',
    
    battle_help_title1: 'Statistical Impact',
    battle_help_desc1: 'Your Strength (STR) and Level now multiply your damage output. Stronger athletes deal more damage per rep.',
    battle_help_title2: 'Critical Variance',
    battle_help_desc2: 'Your Agility (AGI) increases the chance of Critical Hits, while Power (PWR) increases their damage.',
    boss_status: 'Boss Status',
  },
  es: {
    // Landing
    landing_title: 'Plataforma de Entrenamiento de Élite',
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

    // Sección de Estadísticas
    stats_effort: 'Esfuerzo Total',
    stats_tonnage: 'Tonelaje Total',
    stats_consistency: 'Racha de Consistencia',
    stats_protocol_goal: 'Meta del Protocolo',
    stats_per_day: 'POR DÍA',
    stats_total_reps: 'REPS TOTALES',

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
    onboarding_subtitle: 'Tu ecosistema de entrenamiento de élite.',
    onboarding_mission_title: 'La Misión',
    onboarding_mission_desc: 'Registra tus reps y gana Reppy Coins (RC). Cada serie cuenta para tu progreso y estatus en el circuito global.',
    onboarding_damage_title: 'Impacto Universal',
    onboarding_damage_desc: 'Tus reps infligen daño a los Boss. 1 Rep = 1 Daño Base, multiplicado por tu nivel de Fuerza. ¡Derrótalos para ganar botín!',
    onboarding_rewards_title: 'La Armería',
    onboarding_rewards_desc: 'Gasta tus RC en la tienda en títulos, bordes y efectos exclusivos. Reclama cofres de bosses caídos para aumentar tu colección.',
    onboarding_social_title: 'Conexión Neural',
    onboarding_social_desc: '¡Novedad! El muro social ahora está activo. Mira las publicaciones de tus amigos, dales like y comenta sus logros para motivar a la comunidad.',
    onboarding_btn_next: 'Siguiente Fase',
    onboarding_btn_back: 'Anterior',
    onboarding_btn_finish: 'Iniciar Operación',
    
    // Categorías
    cat_all: 'Todas las Unidades',
    cat_title: 'Títulos de Honor',
    cat_border: 'Marcos de Avatar',
    cat_avatar: 'Avatares',
    cat_background: 'Pantallas de Interfaz',
    cat_bundle: 'Pack de Bienvenida',
    
    // Exercise Mastery
    exercise_mastery: 'Maestría de Ejercicios',
    exercise_mastery_desc: 'REPOSITORIO HISTÓRICO DE MAGNITUD POR EJERCICIO',

    // Codex
    codex_title: 'EL CODEX',
    codex_subtitle: 'GUÍA DE EVOLUCIÓN RPG',
    codex_next_lv: 'PRÓXIMO NIVEL: +100 XP REQUERIDOS',
    codex_lv_up: 'Mejora:',

    codex_str_name: 'FUERZA',
    codex_str_quote: 'El poder destructivo puro.',
    codex_str_desc: 'Mide tu fuerza total. Aumenta al añadir peso a tus ejercicios (ej: usando lastre).',
    codex_str_action: 'Añade lastre para mejorar.',

    codex_pwr_name: 'PODER',
    codex_pwr_quote: 'Impacto crítico explosivo.',
    codex_pwr_desc: 'Mide tu capacidad de esfuerzo máximo en una sola serie. Aumenta llevando tu cuerpo al límite en tiempo o intensidad.',
    codex_pwr_action: 'Haz variantes más difíciles.',

    codex_end_name: 'RESISTENCIA',
    codex_end_quote: 'Tu tanque de energía.',
    codex_end_desc: 'Mide tu aguante general. Aumenta entrenando múltiples repeticiones de tus protocolos durante cada día.',
    codex_end_action: 'Acumula más repeticiones diarias.',

    codex_agi_name: 'AGILIDAD',
    codex_agi_quote: 'Determinación constante.',
    codex_agi_desc: 'Mide tu disciplina y constancia. Aumenta manteniendo tu racha de días activos y diversificando tu entrenamiento.',
    codex_agi_action: 'Mantén tu racha activa.',

    // Shop Categories
    shop_tab_titles: 'TÍTULOS',
    shop_tab_borders: 'MARCOS',
    shop_tab_avatars: 'AVATARES',
    shop_tab_backgrounds: 'EFECTOS',
    shop_tab_post_backgrounds: 'POSTS',
    shop_bundles_title: 'PACKS DE BIENVENIDA ÉLITE',

    // Post Backgrounds
    'post-bg-carbon_name': 'Carbon Scan',
    'post-bg-carbon_desc': 'Textura de carbono oscuro con línea de escaneo láser.',
    'post-bg-neon_name': 'Neon Pulse',
    'post-bg-neon_desc': 'Borde de neón con pulso reactivo vibrante.',
    'post-bg-matrix_name': 'Matrix Rain',
    'post-bg-matrix_desc': 'Lluvia de código digital optimizada para tu muro.',
    'post-bg-inferno_name': 'Inferno Core',
    'post-bg-inferno_desc': 'Calor extremo con brasas y distorsión térmica.',
    'post-bg-void_name': 'Void Gravity',
    'post-bg-void_desc': 'Punto de no retorno con distorsión gravitacional.',

    // Nuevas Secciones SEO
    latest_news: 'ÚLTIMAS NOVEDADES',
    news_subtitle: 'Actualizaciones de entrenamiento, guías de calistenia y noticias de la comunidad.',
    view_all_articles: 'Ver todos los artículos',
    trending: 'Tendencia',
    read_time: 'min de lectura',
    related_protocols: 'Protocolos Relacionados',
    share_knowledge: 'Comparte este conocimiento',
    copy_link: 'Copiar enlace',
    share_x: 'Compartir en X',
    share_fb: 'Compartir en Facebook',
    share_li: 'Compartir en LinkedIn',
    share_wa: 'Compartir en WhatsApp',
    back_to_home: 'Volver a inicio',
    start_free: 'EMPEZAR GRATIS',

    // Tarjetas SEO de Ejercicio
    exercise_king: 'Ejercicio Rey',
    push_power: 'Fuerza de Empuje',
    full_ecosystem: 'Ecosistema Completo',
    pullup_guide_title: 'Cómo hacer tu primera dominada: Guía Maestra',
    pullup_guide_desc: 'Protocolos de progresión desde cero hasta dominar la barra.',
    gamification_title: 'Gamificación y Calistenia: Por qué funciona Reppy',
    gamification_desc: 'La ciencia detrás de los puntos de experiencia y la motivación en el fitness.',
    pullup_seo_title: 'Contador de Dominadas Online',
    pullup_seo_desc: 'Registra tus pull-ups y compite en el ranking mundial.',
    pushup_seo_title: 'Contador de Flexiones Gratis',
    pushup_seo_desc: 'Lleva la cuenta de tus push-ups y sube de nivel tus atributos.',
    rpg_protocol_title: 'Explorar Protocolos RPG',
    rpg_protocol_desc: 'Descubre todas las funciones de gamificación de Reppy.',

    // Exercise Landing - Dominadas
    el_pullup_eyebrow: 'App de Dominadas Gratuita',
    el_pullup_h1: 'Contador de Dominadas Online con Progresión RPG',
    el_pullup_subtext: 'Registra tus pull-ups, visualiza tu consistencia con heatmaps y compite en el ranking global de calistenia.',
    el_pullup_card_label: 'ESTADÍSTICA PULL-UP',
    el_pullup_card_title: 'Volumen Mensual',
    el_pullup_section1_h2: '¿Para qué sirve un contador de dominadas?',
    el_pullup_section1_body: '<p>Tener un registro exacto de cuántas dominadas haces cada día es la única forma real de asegurar una <strong>sobrecarga progresiva</strong>. Nuestro contador automático no solo guarda el número, sino que lo asigna a tus atributos de Fuerza y Potencia.</p><p>Olvídate de las notas del móvil. Con Reppy tienes un historial visual estilo GitHub que te motiva a no dejar huecos en blanco.</p>',
    el_pullup_section2_h2: 'Cómo mejorar tus dominadas',
    el_pullup_tip1_title: 'Volumen Semanal',
    el_pullup_tip1_body: 'No busques solo el máximo en un set. Registra el volumen total semanal y trata de aumentarlo un 5% cada mes.',
    el_pullup_tip2_title: 'Variedad de Agarre',
    el_pullup_tip2_body: 'Combina dominadas pronas, supinas y neutras. Reppy cuenta todas por igual para tu progresión de nivel.',
    el_pullup_tip3_title: 'Constancia sobre Intensidad',
    el_pullup_tip3_body: 'Es mejor hacer 50 dominadas 5 días a la semana que un solo día de 200. El heatmap te ayudará a verlo.',
    el_pullup_guide_h2: 'Guía Completa para Dominadas Perfectas',
    el_pullup_article: `
      <h3>La importancia del seguimiento en calistenia</h3>
      <p>Muchos atletas de calistenia se estancan porque no saben exactamente cuánto volumen están manejando. Un <strong>contador de dominadas</strong> serio es el primer paso para salir del estancamiento. Al registrar cada serie, puedes observar tendencias, detectar sobreentrenamiento o, por el contrario, darte cuenta de que no estás entrenando con la frecuencia suficiente.</p>
      
      <h3>Técnica y Calidad</h3>
      <p>Hacer una dominada no es solo subir la barbilla por encima de la barra. Se trata de control escapular, evitar el balanceo (kipping) y completar el rango de movimiento. En Reppy, fomentamos la calidad. Cada repetición que añades al contador debería ser una repetición "limpia".</p>
      
      <h3>¿Por qué elegir Reppy para tus pull-ups?</h3>
      <p>A diferencia de otras aplicaciones de fitness genéricas, Reppy está diseñado por y para personas que practican <strong>street workout</strong>. Entendemos que el progreso en el peso corporal es lento pero muy gratificante. Por eso hemos gamificado la experiencia: cada entrenamiento contribuye a tu nivel global, permitiéndote desbloquear cosméticos y competir con otros atletas de todo el mundo.</p>
    `,

    // Exercise Landing - Flexiones
    el_pushup_eyebrow: 'App de Flexiones Gratuita',
    el_pushup_h1: 'Contador de Flexiones Online y Tracker de Progresión',
    el_pushup_subtext: 'Lleva la cuenta de tus push-ups, sube de nivel tus atributos y mantén tu rendimiento al máximo con analíticas avanzadas.',
    el_pushup_card_label: 'ESTADÍSTICA PUSH-UP',
    el_pushup_card_title: 'Resistencia Total',
    el_pushup_section1_h2: '¿Por qué usar un contador de flexiones?',
    el_pushup_section1_body: '<p>Las flexiones son el ejercicio base de cualquier rutina de empuje. Sin un <strong>contador de flexiones</strong>, es fácil perder la cuenta en series de alto volumen o "mentirse" a uno mismo sobre el progreso real.</p><p>Registrar tus series te permite ver si estás mejorando en resistencia (endurance) o si necesitas pasar a variantes más difíciles para seguir ganando fuerza.</p>',
    el_pushup_section2_h2: 'Cómo hacer más flexiones',
    el_pushup_tip1_title: 'Frecuencia Alta',
    el_pushup_tip1_body: 'Al ser un ejercicio con menos peso relativo, puedes entrenarlo con más frecuencia. Reppy te ayuda a mantener la racha diaria.',
    el_pushup_tip2_title: 'Variantes de Empuje',
    el_pushup_tip2_body: 'Registra desde flexiones diamante hasta flexiones a una mano. Todas contribuyen a tu atributo de Fuerza (STR).',
    el_pushup_tip3_title: 'Control del Core',
    el_pushup_tip3_body: 'Una flexión es una plancha en movimiento. No olvides mantener el abdomen tenso para proteger tu espalda.',
    el_pushup_guide_h2: 'Guía Maestra de Flexiones y Variantes',
    el_pushup_article: `
      <h3>Del principiante al experto</h3>
      <p>Cualquiera puede empezar a usar un <strong>contador de flexiones</strong>. Si no puedes hacer una flexión estándar, registra tus inclinadas. El objetivo es que el número en tu dashboard suba día a tras día. La progresión es el corazón de la calistenia.</p>
      
      <h3>Entrenamiento gamificado</h3>
      <p>Imagina que cada flexión es un golpe a un enemigo en un RPG. Esa es la filosofía de Reppy. Al convertir el esfuerzo físico en experiencia digital (XP) y monedas, reducimos la fricción mental de empezar un entrenamiento. Ya no es "tengo que entrenar", es "tengo que subir de nivel".</p>
    `,
    el_cta_h2: '¿Listo para empezar a contar?',
    el_cta_btn: 'CREAR CUENTA AHORA',
    el_cta_footer: '100% GRATIS · SIN TARJETAS · CALISTENIA PURA',
    el_back_home: 'Volver al Inicio de Reppy',
    el_latest_blog: 'Último del Blog: Rutina David Goggins',
    
    // Blog List & 404
    blog_list_title: 'Protocolos y Noticias de Entrenamiento',
    blog_list_subtitle: 'Las últimas guías de calistenia, protocolos mentales y actualizaciones de la comunidad Reppy.',
    pagination_next: 'Página Siguiente',
    pagination_prev: 'Página Anterior',
    not_found_title: 'ÁREA RESTRINGIDA (404)',
    not_found_desc: 'El protocolo que buscas ha sido movido o eliminado del mainframe.',
    not_found_btn: 'VOLVER A ZONA SEGURA',

    // Battle Overhaul Modal
    battle_overhaul_title: 'ACTUALIZACIÓN DEL SISTEMA DE BATALLA',
    battle_overhaul_subtitle: 'SISTEMA DE DAÑO RPG MEJORADO ACTIVO',
    battle_overhaul_str_desc: 'Aumenta el daño base y el impacto físico.',
    battle_overhaul_pwr_desc: 'Aumenta el daño crítico y la energía mágica.',
    battle_overhaul_agi_desc: 'Aumenta la probabilidad aleatoria de golpes críticos.',
    battle_overhaul_summary: 'Tus estadísticas RPG (STR, PWR, AGI) y tu Nivel Global ahora se combinan para calcular daños masivos. ¡Los niveles altos pueden infligir más de 100 de daño por rep!',
    battle_overhaul_boss_hint: 'Los bosses se han fortalecido para igualar tu nuevo poder.',
    battle_overhaul_btn: 'ENTRAR EN BATALLA',
    stat_str: 'FUERZA',
    stat_pwr: 'PODER',
    stat_agi: 'AGILIDAD',
    
    battle_help_title1: 'Impacto Estadístico',
    battle_help_desc1: 'Tu Fuerza (STR) y Nivel ahora multiplican tu daño. Los atletas más fuertes infligen más daño por rep.',
    battle_help_title2: 'Varianza Crítica',
    battle_help_desc2: 'Tu Agilidad (AGI) aumenta la probabilidad de Críticos, mientras que el Poder (PWR) aumenta su daño.',
    boss_status: 'Estado del Boss',
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
