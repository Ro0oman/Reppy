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
    lb_you: 'YOU',
    lb_pro_athlete: 'PRO ATHLETE',
    lb_data_null: 'PROTOCOL DATA NULL',
    lb_level: 'LEVEL',
    
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

    // Boss Battle
    boss_class_active: 'CLASS: ACTIVE SECTOR',
    boss_how_damage: 'HOW DO I DEAL MORE DAMAGE?',
    boss_battle_manual: 'BATTLE MANUAL',
    boss_protocol_complete: 'DOWN PROTOCOL COMPLETED',
    boss_target_integrity: 'TARGET INTEGRITY',
    boss_neutralized: '0% INTEGRITY - TARGET NEUTRALIZED',
    boss_hist_damage: 'Your Historical Damage',
    boss_today_damage: 'Damage Dealt Today',
    boss_domination: 'Domination (Top 1)',
    boss_req_damage: 'DAMAGE REQUIRED:',
    boss_claim_loot: 'CLAIM LOOT',
    boss_reward_acquired: 'REWARD_ACQUIRED',
    boss_login_to_damage: 'Sign in to log damage and access loot',
    boss_next_protocol: 'Next Protocol',
    boss_locked: 'Locked 🔒',
    boss_op_manual: 'Operations Manual',
    boss_community_event: 'Community Event',
    boss_reward_chest: 'Reward Chest',
    boss_reward_desc: 'By defeating the boss, you unlock a chest with a guaranteed Season (or Normal) item.',
    boss_close_manual: 'Close Manual',
    boss_active_now: 'Current Active Boss',
    boss_refresh_hint: 'Refresh page to see new phrases',
    boss_weakness: 'Weakness',
    battle_help_title1: 'UNIFIED ATTACK',
    battle_help_desc1: 'Every rep you track deals damage to the boss. Pull-ups, push-ups and dips all count toward victory.',
    battle_help_title2: 'PROGRESSION & LORE',
    battle_help_desc2: 'Defeating bosses advances the community storyline and unlocks new sectors in the Reppy world.',
     economy_title: 'ECONOMY.CODEX',
    economy_subtitle: 'Resource allocation protocol',
    economy_revenue: 'REVENUE GENERATION',
    economy_legendary: 'LEGENDARY DROPS',
    economy_rep: 'RC / REP',
    economy_status_optimal: 'System Status: Optimal',
    economy_privacy: 'Privacy Protocol',
    economy_star_github: 'STAR ON GITHUB',
    economy_admin: 'ADMIN.CMD',
    economy_history_title: 'Protocol Coins History',
    economy_my_profile: 'My Profile',
    economy_reppy_core: 'Reppy Core © 2026',

    // Exercise Names
    ex_pullups_std: 'Pullups (Standard)',
    ex_pushups_std: 'Pushups (Standard)',
    ex_dips_std: 'Dips (Standard)',
    ex_weighted_pullups: 'Weighted Pullups',
    ex_muscle_ups: 'Muscle Ups',

    // Login
    login_title: 'Sign In',
    login_welcome: 'Welcome to Reppy',
    login_subtitle: 'SYSTEM ACCESS PROTOCOL',
    login_password: 'Password',
    login_email: 'Email',
    login_name: 'Full Name',
    login_name_placeholder: 'ex: John Doe',
    login_or_continue: 'OR CONTINUE WITH',
    login_btn_login: 'Identify',
    login_btn_signup: 'Create Account',
    login_btn_register: 'Register',
    login_btn_back: 'Back',

    // Welcome Modal
    welcome_damage: 'DAMAGE',
    welcome_bonus: '+ Critical Bonus (AGI) and Global Multiplier',

    // Shop
    shop_prev: 'Previous Page',
    shop_next: 'Next Page',
    shop_go_to: 'Go to page',

    // Profile
    profile_guide_title: 'Evolution Protocol Guide',
    profile_file_too_large: 'File too large (Max 2MB)',
    profile_updated: 'Biometric core updated',

    // Notifications
    notif_anomalies: 'ANOMALIES DETECTED',
    notif_close: 'Close Notification',

    // Lucky Wheel
    wheel_title_start: 'Lucky',
    wheel_title_end: 'Wheel',
    wheel_subtitle: 'Spin daily to win coins, chests, and power-ups.',
    wheel_btn_spin: 'SPIN',
    wheel_btn_spinning: '...',
    wheel_already_spun: "You've already used your daily spin",
    wheel_btn_close: 'Close',
    wheel_legendary: 'LEGENDARY ITEM!',
    wheel_try_tomorrow: 'TRY AGAIN TOMORROW',
    wheel_congrats: 'Congratulations on your prize!',
    wheel_return_tomorrow: 'Cya tomorrow for more luck',
    wheel_nothing: 'NOTHING',
    wheel_coins: 'REPPY COINS',
    wheel_potion: 'POWER POTION',
    wheel_level_chest: 'LEVEL CHEST',
    wheel_new_balance: 'New balance',
    wheel_prizemsg_coins: '+{value} REPPY COINS',
    wheel_prizemsg_item: '¡{name}! 🏆',
    wheel_prizemsg_chest: '¡Level Chest! 🎁',

    // Level Bar
    level_xp_info: 'Earn XP to gain LOOT CHESTS. Every rep counts.',

    // Inventory
    inv_common_chest_desc: 'Earned through physical evolution. Decrypt for common gear and gold.',
    inv_boss_chest_desc: 'Discovered after defeating anomalies. Decrypt for legendary loot.',

    // Dashboard
    dash_max_month: 'Max Month',
    dash_max_month_tooltip: 'Maximum volume achieved in a single month',
    dash_total_tonnage_tooltip: 'Total tonnage moved (Reps x Resistance)',

    // Boss History
    boss_hist_modal_title: 'DAMAGE HISTORY',

    // FAQ
    faq_q1: 'Is Reppy free?',
    faq_a1: 'Yes, Reppy is 100% free. You can sign up with Google and start tracking your calisthenics reps at no cost.',
    faq_q2: 'What exercises can I track?',
    faq_a2: 'You can track standard calisthenics movements: Pullups, Pushups, Dips, Muscle Ups, and Weighted Pullups. Each deals a different amount of damage to bosses.',
    faq_q3: 'How does the RPG system work?',
    faq_a3: 'Every rep gives you Reppy Coins and XP in 6 attributes: Strength (STR), Dexterity (DEX), Endurance (END), Vigor (VIG), Intellect (INT), and Faith (FTH). Spend coins for cosmic status.',
    faq_q4: 'What are Boss Fights?',
    faq_a4: 'They are community events where everyone fights an epic boss. Every rep you track deals damage based on your 6 RPG stats. When defeated, everyone wins loot chests.',
    faq_q5: 'Can I see my training progress?',
    faq_a5: 'Yes. Reppy includes a GitHub-style activity heatmap, streak stats, total volume, and daily progress targets.',
    faq_q6: 'Can I compete with others?',
    faq_a6: 'Yes. Global rankings are filtered by day, week, month, and all-time. You can also add friends for a private leaderboard.',
    faq_q8: 'Do I need to download anything?',
    faq_a8: 'No. Reppy is a web app that works in your browser. Compatible with Chrome, Firefox, Safari, and Edge.',
    
    // Activity
    activity_damage_session: 'damage in this session',
    activity_shared: 'Shared successfully!',
    activity_copied: 'Workout link copied!',
    activity_total_reached: 'total reached!',
    activity_has_inflicted: 'has inflicted',
    activity_inflicted_you: 'You have inflicted',
    activity_post_comment_placeholder: 'Write a tactical comment...',
    activity_no_records: 'No records yet',
    activity_share_title: 'Reppy - Training Protocol',
    activity_share_msg: "Check out {name}'s workout on Reppy",
    activity_error_share: 'Error sharing',
    activity_comment_hint: 'Write a tactical comment...',
    activity_boost_active: 'BUFF ACTIVE',
    
    // Articles
    article_guide_tag: 'Training Guide',
    article_title1: 'How to do your first pull-up: Master Guide',
    article_desc1: 'Progression protocols from zero to mastering the bar.',
    article_title2: 'Gamification & Calisthenics: Why Reppy Works',
    article_desc2: 'The science behind experience points and motivation in fitness.',
    blog_learn_more: 'Learn the full technique at:',
    blog_read_ultimate: 'Read Ultimate Guide',
    
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
    cat_consumable: 'Consumables',

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
    codex_str_desc: 'Increases base damage and scaling for heavy exercises like Muscleups and Weighted Pullups.',
    codex_str_action: 'Do weighted exercises or explosive movements.',

    codex_dex_name: 'DEXTERITY',
    codex_dex_quote: 'Precision over force.',
    codex_dex_desc: 'Increases Critical Hit chance and the damage they deal. Every level significantly boosts your impact against Bosses.',
    codex_dex_action: 'Muscle-ups and Weighted Pull-ups: You gain 10 base XP + extra weight per rep.',

    codex_end_name: 'ENDURANCE',
    codex_end_quote: 'The fire that never goes out.',
    codex_end_desc: 'Secondary damage scaling based on total repetition volume. Ideal for high-volume sets.',
    codex_end_action: 'Accumulate more daily reps.',

    codex_vig_name: 'VIGOR',
    codex_vig_quote: 'Iron mind, unbreakable body.',
    codex_vig_desc: 'Increases your resilience and adds stability to your critical hits. Earned through training streaks.',
    codex_vig_action: 'Keep your daily streak alive.',

    codex_int_name: 'INTELLIGENCE',
    codex_int_quote: 'Knowledge is the ultimate gains.',
    codex_int_desc: 'Training efficiency. Grants a global XP bonus (+5% per level) to all training stats. Earned by reading tactical guides.',
    codex_int_action: 'Read tactical guides in the blog to level up Intelligence.',

    codex_fth_name: 'FAITH',
    codex_fth_quote: 'The bar provides, the iron judge.',
    codex_fth_desc: 'Divine damage and community aura. Increases your Holy damage multiplier and provides extra flat damage bonuses.',
    codex_fth_action: 'Participate in Boss Battles. Every 50 damage dealt grants 1 XP.',
    blog_xp_gained: 'Knowledge acquired! +100 INT XP earned.',
    intelecto_adquirido: 'KNOWLEDGE ACQUIRED',
    blog_read_congrats: 'Protocol complete: Intellect increased.',

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
    battle_overhaul_dex_desc: 'Increase Critical Hits and precise strikes.',
    battle_overhaul_end_desc: 'Increase stamina and volume scaling.',
    battle_overhaul_vig_desc: 'Increase resilience and critical stability.',
    battle_overhaul_int_desc: 'Improve efficiency and level multipliers.',
    battle_overhaul_fth_desc: 'Unleash Holy Damage and divine bonuses.',
    battle_overhaul_summary: 'Your 6 RPG stats and Global Level now combine for massive impact. High levels can deal 100+ damage per rep!',
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
    btn_cancel: 'Cancel',
    btn_confirm: 'Confirm',
    battle_overhaul_boss_alert: 'BOSS HP x10 INCREASE',
    codex_close: 'Close Protocol',

    // New common buttons
    btn_save: 'Save Changes',
    btn_acquired: 'Acquired',
    btn_acquire: 'Acquire',
    btn_get: 'Get',
    btn_lock: 'Lock',
    btn_equip: 'Equip',
    btn_on: 'ON',
    btn_activate: 'Activate',
    consumable_activated: 'Booster Activated',
    damage_boost: 'Damage Boost',
    settings_title: 'Profile Settings',
    settings_success: 'Profile settings updated successfully.',
    settings_error: 'Failed to update settings.',

    // Profile specific
    profile_decrypting: 'DECRYPTING PROFILE...',
    profile_recruit: 'RECRUIT',
    profile_xp_to_next: 'XP TO NEXT LVL',
    profile_reward_protocol: '🎁 REWARD PROTOCOL',
    profile_reward_desc: 'Level up reward chests are added automatically to your inventory.',
    profile_activity_audit: 'ACTIVITY AUDIT',
    profile_rc_history: 'REPPY COINS HISTORY',
    profile_no_transactions: 'NO_TRANSACTIONS_RECORDED',
    profile_load_more: 'LOAD MORE TRANSACTIONS',
    profile_loading: 'COMMUNICATION...',

    // Shop specific
    shop_armory_title: 'ARMORY',
    shop_armory_subtitle: 'Equip your legend with elite protocol cosmetics.',
    shop_reppy_coins: 'REPPY COINS',
    shop_elite_pack: 'ELITE_PACK',
    shop_special_deal: 'Special Deal',
    shop_permanent_protocol: 'PERMANENT PROTOCOL',
    shop_screen_preview: 'SCRN.PRVW',
    shop_post_preview: 'POST.PRVW',
    shop_decrypt_at: 'DECRYPT AT',
    shop_module_contents: 'MODULE_CONTENTS',
    shop_bundle_cost: 'BUNDLE_COST',
    shop_initiate_acquisition: 'INITIATE ACQUISITION',
    
    // Roulette
    roulette_exe_available: 'ROULETTE.EXE AVAILABLE',
    feat_yield_title: 'EXCEPTIONAL YIELD',
    boss_anomaly: 'BOSS ANOMALIES',
    monthly_projection: 'MONTHLY PROJECTION',
    active_yield_desc: 'ACTIVE OPERATIVES YIELD',

    // Social & Community
    community: 'COMMUNITY',
    community_subtitle: 'SYNCHRONIZE WITH THE CORE ELITE.',
    social_wall: 'SOCIAL WALL',
    rankings: 'RANKINGS',
    global_rankings: 'GLOBAL.RANKINGS',
    find_operatives: 'FIND_OPERATIVES',
    inner_circle: 'INNER_CIRCLE',
    reps_collected: 'REPS COLLECTED',
    reps_scaled: 'REPS SCALED',
    protocol_label: 'Protocol',
    live_sync: 'LIVE RANKING SYNCHRONIZATION',
    friend_added: 'Friend added successfully!',
    friend_add_failed: 'Failed to add friend',

    // Landing Page
    landing_hero_title: 'DOMINATE EVERY',
    landing_hero_span: 'REP',
    landing_hero_subtitle: 'The first calisthenics platform with an RPG system. Every rep counts. Every boss falls. Your legend begins today.',
    btn_join_now: 'JOIN NOW',
    btn_continue_adventure: 'CONTINUE ADVENTURE',
    landing_stats_reps: 'Reps Tracked',
    landing_stats_bosses: 'Bosses Slain',
    landing_stats_cost: 'Free Forever',
    landing_stats_score: 'User Score',
    landing_bento_rpg_title: 'INTEGRATED RPG SYSTEM',
    landing_bento_rpg_desc: 'Level up 6 RPG attributes (STR, DEX, END, VIG, INT, FTH) with every rep. Unlock exclusive cosmetics and prove your status.',
    landing_bento_ranking_title: 'GLOBAL RANKING',
    landing_bento_ranking_desc: 'Compete for Top 1 on the global leaderboard.',
    landing_bento_consistency_title: 'CONSISTENCY',
    landing_bento_community_title: 'COMMUNITY',
    landing_guia_title: 'Complete Guide to Progress in Calisthenics',
    landing_guia_subtitle: 'Everything you need to know about bodyweight training',
    landing_final_cta_title: 'Start your legend today',
    landing_final_cta_desc: 'Join the Reppy calisthenics community. Track push-ups, dips, and muscle-ups. 100% free, forever.',
    btn_create_account_free: 'Create your free account forever',

    // Landing Article
    landing_art_intro_title: 'Introduction to Street Workout',
    landing_art_intro_p1: 'Calisthenics, also known as street workout, is an ancient discipline that focuses on using your own body weight to gain strength, agility, and muscle control. Unlike conventional weight training, calisthenics requires brutal intermuscular coordination and exceptional relative strength (strength per pound of weight).',
    landing_art_intro_p2: 'In recent years, the popularity of this sport has exploded thanks to its accessibility. All you need is a pull-up bar and willpower. However, this simplicity is a double-edged sword: it is very easy to get lost in the routine and not see results if strict records are not kept. This is where a calisthenics tracker like Reppy makes the difference.',
    landing_art_pullups_title: 'Mastering the Bar: The Pull-Up Path',
    landing_art_pullups_p1: 'Pull-ups are undoubtedly the king of calisthenics exercises for the upper body. They involve the latissimus dorsi, traps, rhomboids, biceps, and of course, the core. Performing your first pull-up is an initiation rite for any athlete. But how do you go from 1 to 10, or 10 to 20?',
    landing_art_pullups_p2: 'The key lies in total training volume. Do not look for muscle failure in every set. Instead, perform multiple sets leaving 1 or 2 repetitions in reserve (RPE 8). By using Reppy to count your pull-ups, you will see that adding small sets throughout the day or during training drastically increases your total weekly volume. This controlled fatigue accumulation is what generates the neural and muscular adaptations necessary to progress.',
    landing_art_psych_title: 'The Psychology of Fitness: Gamification',
    landing_art_psych_p1: 'Why is it so hard for us to go train but we can spend hours leveling up in a video game? The answer lies in the immediate feedback loop. In the gym, results take months to see. In an RPG, you see your experience bar rise after every combat.',
    landing_art_psych_p2: 'At Reppy we have hacked this system. By converting every push-up and pull-up into "damage" dealt to a boss or experience for your character, we create immediate satisfaction that keeps your motivation through the roof. You no longer train just for your physical health, but so that your athlete profile reflects the effort you are putting in. This social and gamified component reduces the abandonment rate by more than 60% according to our internal community studies.',
    landing_art_nutri_title: 'Nutrition and Rest in Calisthenics',
    landing_art_nutri_p1: 'No rep counter can save you if you do not rest and eat correctly. Muscle tissue is damaged during training and repaired (grows) during sleep. Make sure to consume at least 1.8g of protein per kilo of weight and sleep between 7 and 9 hours daily.',
    landing_art_nutri_p2: 'Remember that in calisthenics, your body weight is your resistance. If you gain unnecessary fat, your pull-ups will become harder. Maintaining a slight but controlled calorie surplus is ideal for gaining strength without sacrificing your mobility (DEX) on the bar. Use the coins you earn in Reppy as a reminder that effort has rewards, both virtual and physical.',
    landing_art_concl_title: 'Conclusion: The Future of Your Training',
    landing_art_concl_p1: 'The path to a strong and functional body has no shortcuts, but it does have tools that make it more bearable. Reppy is not just an application; it is your partner on the bars, your record of life, and your community. Whether you are a beginner looking for your first push-up or an expert looking for Top 1 in the muscle up rankings, we are here to count every one of your victories.',
    landing_art_concl_p2: 'No more training in the dark. It\'s time to play seriously. It\'s time for Reppy.',

    // Landing Features
    landing_feat_heatmap_title: 'Activity Heatmap',
    landing_feat_heatmap_desc: 'Visualize your training consistency with a GitHub-style graph. See at a glance which days you trained pull-ups, push-ups or dips. Filter by exercise and full year.',
    landing_feat_rankings_title: 'Global Rankings',
    landing_feat_rankings_desc: 'Compete in the world ranking for pull-ups and calisthenics. Filter by today, week, month or all-time. Rise in position and prove who is the best.',
    landing_feat_social_title: 'Social Community',
    landing_feat_social_desc: 'Add friends, visit their public profiles and compare your calisthenics progress. Create your training circle and stay motivated.',
    
    // Boss Fights
    landing_boss_title: 'Community Boss Fights',
    landing_boss_desc: 'Participate in global events where the entire community fights an epic boss. Every pull-up, push-up, or dip you log deals damage. When the community defeats it, everyone wins chests with legendary rewards.',
    landing_boss_how: 'How do they work?',
    landing_boss_step1_title: 'A Boss Appears',
    landing_boss_step1_desc: 'A boss with thousands of health points appears during a temporary event. The whole community can participate.',
    landing_boss_step2_title: 'Log Reps',
    landing_boss_step2_desc: 'Every pull-up, push-up or dip you do deals damage. Watch the health bar drop in real-time.',
    landing_boss_step3_title: 'Win Rewards',
    landing_boss_step3_desc: 'When the boss falls, all participants unlock chests with exclusive titles, frames, and effects.',

    // How to Use
    landing_how_title: 'How it works',
    landing_how_subtitle: 'Start tracking your pull-ups and push-ups in 3 steps',
    landing_how_step1_title: 'Sign up with Google',
    landing_how_step1_desc: 'No password, no complications. One click with your Google account and you\'re in.',
    landing_how_step2_title: 'Track your Reps',
    landing_how_step2_desc: 'Select pull-ups, push-ups, dips or muscle ups. Input the number and hit add. They count now.',
    landing_how_step3_title: 'Compete and Level Up',
    landing_how_step3_desc: 'Earn coins, raise your global ranking, buy cosmetics in the shop and defeat bosses with the community.',

    // FAQ & LB
    landing_faq_title: 'Frequently Asked Questions',
    landing_lb_title_main: 'Global Ranking',
    landing_lb_subtitle_main: 'Real-time pull-up and calisthenics ranking',
    landing_lb_join: 'JOIN THE RANKING',
    landing_footer_copy: 'REPPY © 2026',
    landing_footer_free: 'Free Calisthenics App',
    landing_footer_exercises: 'Pull-ups · Push-ups · Dips',
    landing_footer_desc: 'Reppy is a calisthenics tracker with an RPG system to log pull-ups, push-ups, dips, muscle ups and weighted pull-ups. Available in English and Spanish.',

    // Additional Shop/UI
    shop_seasonal_title: 'SEASONAL PROTOCOL',
    shop_seasonal_subtitle: 'Special event rewards & milestone artifacts.',
    shop_stock: 'STOCK',
    shop_event_badge: 'EVENT',
    shop_special_badge: 'SPECIAL',
    shop_seasonal_badge: 'SEASONAL',
    shop_unit_page: 'UNIT_PAGE',
    shop_total_chunks: 'TOTAL_CHUNKS',
    shop_tab_post_backgrounds: 'POSTS',

    // Additional Inventory
    inv_title: 'INVENTORY.RPG',
    inv_subtitle: 'Manage your attributes and gear',
    inv_tab_stats: 'ATTRIBUTES',
    inv_tab_gear: 'GEAR',
    inv_level_card_title: 'Character Level',
    inv_level_card_subtitle: 'Level up to earn chests and destructive power',
    inv_next_level: 'NEXT LEVEL',
    inv_empty_title: 'Empty Armory',
    inv_empty_desc: 'Defeat bosses to get legendary gear',
    inv_level_chest: 'LEVEL CHEST',
    inv_boss_chest: 'MECHANICAL CHEST',
    inv_xp_left: 'LEFT',
    xp_label: 'XP',
    inv_available: 'AVAILABLE',
    inv_new_badge: 'NEW',
    inv_cat_titles: 'Titles',
    inv_cat_borders: 'BORDERS',
    inv_cat_backgrounds: 'Wallpapers',
    inv_cat_post_backgrounds: 'WALL BACKGROUNDS',
    inv_cat_avatar_effects: 'AVATAR EFFECTS',
    inv_cat_consumables: 'CONSUMABLES',
    inv_dismiss_data: 'DISMISS DATA',

    // Additional Dashboard
    dash_global_view_active: 'Global view active. Select a protocol to log volume.',
    dash_boss_status: 'Boss Status',
    dash_goal_achieved: 'Goal achieved.',
    dash_analyzing_performance: 'Analyzing performance...',
    dash_streak: 'Streak',
    dash_peak_volume: 'Peak Volume',
    dash_total_tonnage: 'Total Tonnage',
    dash_history_title: 'Activity History',
    dash_tons_moved: 'TONS MOVED',
    dash_protocol_null: 'Protocol Null',

    // Reps Input
    rep_protocol_active: 'Protocol {type} active',
    rep_manual_entry: 'Manual entry',
    rep_additional_weight: 'Additional load (Kg)',

    // Boss
    battle_history: 'Battle History',
    boss_dmg_label: 'DMG',
    boss_damage_active: 'DMG ACTIVE',
    boss_assault: 'BOSS ASSAULT',

    // Activity Card
    activity_level_label: 'LVL',
    activity_reps_label: 'REPS',
    activity_milestone_msg: '{threshold} total {exercise}!',
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
    lb_you: 'TÚ',
    lb_pro_athlete: 'ATLETA PRO',
    lb_data_null: 'DATOS DE PROTOCOLO NULOS',
    lb_level: 'NIVEL',

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

    // Boss Battle
    boss_class_active: 'CLASE: SECTOR ACTIVO',
    boss_how_damage: '¿CÓMO HAGO MÁS DAÑO?',
    boss_battle_manual: 'MANUAL DE BATALLA',
    boss_protocol_complete: 'PROTOCOLO DE CAÍDA COMPLETADO',
    boss_target_integrity: 'INTEGRIDAD DEL OBJETIVO',
    boss_neutralized: '0% INTEGRIDAD - OBJETIVO NEUTRALIZADO',
    boss_hist_damage: 'Tu Daño Histórico',
    boss_today_damage: 'Daño Realizado Hoy',
    boss_domination: 'Dominación (Top 1)',
    boss_req_damage: 'DAÑO REQUERIDO:',
    boss_claim_loot: 'RECLAMAR BOTÍN',
    boss_reward_acquired: 'RECOMPENSA_ADQUIRIDA',
    boss_login_to_damage: 'Inicia sesión para registrar tu daño y acceder al botín',
    boss_next_protocol: 'Próximo Protocolo',
    boss_locked: 'Bloqueado 🔒',
    boss_op_manual: 'Manual de Operaciones',
    boss_community_event: 'Evento de la Comunidad',
    boss_reward_chest: 'Cofre de Recompensa',
    boss_reward_desc: 'Al derrotar al boss, desbloqueas un cofre con un objeto de Temporada (o Normal) garantizado.',
    boss_close_manual: 'Cerrar Manual',
    boss_active_now: 'Boss Actual Activo',
    boss_refresh_hint: 'Actualiza la página para ver nuevas frases',
    boss_weakness: 'Debilidad',
    battle_help_title1: 'ATAQUE UNIFICADO',
    battle_help_desc1: 'Cada repetición que registras inflige daño al boss. Dominadas, flexiones y fondos cuentan para la victoria.',
    battle_help_title2: 'PROGRESIÓN E HISTORIA',
    battle_help_desc2: 'Derrotar bosses avanza la historia de la comunidad y desbloquea nuevos sectores en el mundo Reppy.',
    economy_title: 'ECONOMÍA.CODEX',
    economy_subtitle: 'Protoclo de asignación de recursos',
    economy_revenue: 'GENERACIÓN DE INGRESOS',
    economy_legendary: 'DROPS LEGENDARIOS',
    economy_rep: 'RC / REP',
    economy_status_optimal: 'Estado del Sistema: Óptimo',
    economy_privacy: 'Protocolo de Privacidad',
    economy_star_github: 'ESTRELLA EN GITHUB',
    economy_admin: 'ADMIN.CMD',
    economy_history_title: 'Historial de Monedas',
    economy_my_profile: 'Mi Perfil',
    economy_reppy_core: 'Reppy Core © 2026',

    // Exercise Names
    ex_pullups_std: 'Dominadas (Estándar)',
    ex_pushups_std: 'Flexiones (Estándar)',
    ex_dips_std: 'Fondos (Estándar)',
    ex_weighted_pullups: 'Dominadas Lastradas',
    ex_muscle_ups: 'Muscle Ups',

    // Login
    login_title: 'Iniciar Sesión',
    login_welcome: 'Bienvenido a Reppy',
    login_subtitle: 'PROTOCOLO DE ACCESO AL SISTEMA',
    login_password: 'Contraseña',
    login_email: 'Email',
    login_name: 'Nombre completo',
    login_name_placeholder: 'Ej: John Doe',
    login_or_continue: 'O CONTINÚA CON',
    login_btn_login: 'Identificarse',
    login_btn_signup: 'Crear Cuenta',
    login_btn_register: 'Registrarse',
    login_btn_back: 'Volver',

    // Welcome Modal
    welcome_damage: 'DAÑO',
    welcome_bonus: '+ Bonus por Críticos (AGI) y Multiplicador Global',

    // Shop
    shop_prev: 'Página Anterior',
    shop_next: 'Siguiente Página',
    shop_go_to: 'Ir a la página',

    // Profile
    profile_guide_title: 'Guía del Protocolo de Evolución',
    profile_file_too_large: 'Archivo demasiado grande (Máx 2MB)',
    profile_updated: 'Bio-núcleo actualizado',

    // Notifications
    notif_anomalies: 'ANOMALÍAS DETECTADAS',
    notif_close: 'Cerrar Notificación',

    // Lucky Wheel
    wheel_title_start: 'Ruleta',
    wheel_title_end: 'Diaria',
    wheel_subtitle: 'Gira el dial para ganar monedas, cofres y bufos.',
    wheel_btn_spin: 'GIRAR',
    wheel_btn_spinning: '...',
    wheel_already_spun: "Ya has usado tu giro diario",
    wheel_btn_close: 'Cerrar',
    wheel_legendary: '¡OBJETO LEGENDARIO!',
    wheel_try_tomorrow: 'VUELVE MAÑANA',
    wheel_congrats: '¡Felicidades por tu premio!',
    wheel_return_tomorrow: 'Mañana más y mejor suerte',
    wheel_nothing: 'NADA',
    wheel_coins: 'MONEDAS',
    wheel_potion: 'POCIÓN DE PODER',
    wheel_level_chest: 'COFRE DE NIVEL',
    wheel_new_balance: 'Nuevo saldo',
    wheel_prizemsg_coins: '+{value} MONEDAS',
    wheel_prizemsg_item: '¡{name}! 🏆',
    wheel_prizemsg_chest: '¡Cofre de Nivel! 🎁',

    // Level Bar
    level_xp_info: 'Consigue XP para ganar COFRES DE BOTÍN. Cada repetición suma.',

    // Inventory
    inv_common_chest_desc: 'Ganados por evolución física. Descifra para equipo común y oro.',
    inv_boss_chest_desc: 'Descubiertos tras derrotar anomalías. Descifra para botín legendario.',

    // Dashboard
    dash_max_month: 'Máximo Mes',
    dash_max_month_tooltip: 'Máximo volumen conseguido en un solo mes',
    dash_total_tonnage_tooltip: 'Tonelaje total desplazado (Repeticiones x Resistencia)',

    // Boss History
    boss_hist_modal_title: 'HISTÓRICO DE DAÑO',

    // FAQ
    faq_q1: '¿Reppy es gratis?',
    faq_a1: 'Sí, Reppy es 100% gratuito. Puedes registrarte con Google y empezar a contar tus repeticiones de calistenia sin ningún coste.',
    faq_q2: '¿Qué ejercicios puedo registrar?',
    faq_a2: 'Puedes registrar movimientos estándar: Dominadas, Flexiones, Fondos, Muscle Ups y Dominadas Lastradas. Cada uno inflige un daño distinto a los bosses.',
    faq_q3: '¿Cómo funciona el sistema RPG?',
    faq_a3: 'Cada repe te da Reppy Coins y XP en 6 atributos: Fuerza (STR), Destreza (DEX), Resistencia (END), Vigor (VIG), Intelecto (INT) y Fe (FTH). Gasta monedas por estatus cósmico.',
    faq_q4: '¿Qué son las Boss Fights?',
    faq_a4: 'Eventos donde toda la comunidad lucha contra un boss épico. Cada repetición inflige daño basado en tus 6 stats RPG. Al ganar, todos obtienen cofres.',
    faq_q5: '¿Puedo ver mi progreso de entrenamiento?',
    faq_a5: 'Sí. Reppy incluye un heatmap de actividad estilo GitHub, estadísticas de racha, volumen total y metas diarias personalizadas.',
    faq_q6: '¿Puedo competir con otros?',
    faq_a6: 'Sí. Los rankings globales se filtran por día, semana, mes y total. También puedes añadir amigos para ver un ranking privado.',
    faq_q7: '¿Funciona en el móvil?',
    faq_a7: 'Sí. Reppy está optimizado para móvil con una interfaz responsive y una barra de navegación inferior de acceso rápido.',
    faq_q8: '¿Necesito descargar algo?',
    faq_a8: 'No. Reppy es una web app que funciona en tu navegador. Compatible con Chrome, Firefox, Safari y Edge.',

    // Articles
    article_guide_tag: 'Guía de Entrenamiento',
    article_title1: 'Cómo hacer tu primera dominada: Guía Maestra',
    article_desc1: 'Protocolos de progresión desde cero hasta dominar la barra.',
    article_title2: 'Gamificación y Calistenia: Por qué funciona Reppy',
    article_desc2: 'La ciencia detrás de los puntos de experiencia y la motivación en el fitness.',
    blog_learn_more: 'Aprende la técnica completa en:',
    blog_read_ultimate: 'Leer Guía Definitiva',

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

    avatar_subtitle: 'Personaliza tu perfil',
    delete_subtitle: 'Acción irreversible',

    // Activity
    activity_damage_session: 'de daño en esta sesión',
    activity_shared: '¡Compartido con éxito!',
    activity_copied: '¡Enlace de entrenamiento copiado!',
    activity_total_reached: 'totales!',
    activity_has_inflicted: 'ha infligido',
    activity_inflicted_you: 'Has infligido',
    activity_post_comment_placeholder: 'Escribe un comentario operativo...',
    activity_no_records: 'Aún no hay registros',
    activity_share_title: 'Reppy - Protocolo de Entrenamiento',
    activity_share_msg: 'Echa un vistazo al entrenamiento de {name} en Reppy',
    activity_error_share: 'Error al compartir',
    activity_comment_hint: 'Escribe un comentario operativo...',
    activity_boost_active: 'POTENCIADOR ACTIVO',

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
    codex_str_quote: 'Poder destructivo puro.',
    codex_str_desc: 'Aumenta el daño base y el escalado de ejercicios pesados como Muscleups y Dominadas Lastradas.',
    codex_str_action: 'Haz ejercicios con lastre o movimientos explosivos.',

    codex_dex_name: 'DESTREZA',
    codex_dex_quote: 'Precisión sobre fuerza.',
    codex_dex_desc: 'Aumenta tu probabilidad de Golpe Crítico y el multiplicador de daño crítico. Cada nivel potencia masivamente tu daño contra el Boss.',
    codex_dex_action: 'Muscle-ups y Dominadas Lastradas: Ganás 10 XP base + el peso extra añadido por repetición.',

    codex_end_name: 'RESISTENCIA',
    codex_end_quote: 'El fuego que nunca se apaga.',
    codex_end_desc: 'Escalado secundario de daño basado en el volumen total de repeticiones. Ideal para series largas.',
    codex_end_action: 'Acumula más repeticiones diarias.',

    codex_vig_name: 'VIGOR',
    codex_vig_quote: 'Mente de hierro, cuerpo inquebrantable.',
    codex_vig_desc: 'Aumenta tu resiliencia ante el daño y aporta estabilidad a tus golpes críticos. Se gana con racha de días activos.',
    codex_vig_action: 'Mantén tu racha diaria activa.',

    codex_int_name: 'INTELECTO',
    codex_int_quote: 'El conocimiento es la ganancia definitiva.',
    codex_int_desc: 'Eficiencia de entrenamiento. Otorga un bono global de XP (+5% por nivel) a todos los demás stats. Se gana leyendo guías tácticas.',
    codex_int_action: 'Lee guías tácticas en el blog para subir Inteligencia.',

    codex_fth_name: 'FE',
    codex_fth_quote: 'La barra provee, el hierro juzga.',
    codex_fth_desc: 'Daño divino y aura comunitaria. Aumenta tu daño "Santo" y otorga bonos de daño fijo extra.',
    codex_fth_action: 'Participa en Batallas de Boss. Cada 50 de daño realizado otorga 1 XP.',
    blog_xp_gained: '¡Conocimiento adquirido! +100 XP de INT ganada.',
    intelecto_adquirido: 'INTELECTO ADQUIRIDO',
    blog_read_congrats: 'Protocolo completado: Intelecto aumentado.',

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
    battle_overhaul_dex_desc: 'Aumenta los Golpes Críticos y ataques precisos.',
    battle_overhaul_end_desc: 'Aumenta la estamina y el escalado por volumen.',
    battle_overhaul_vig_desc: 'Aumenta la resiliencia y estabilidad crítica.',
    battle_overhaul_int_desc: 'Mejora la eficiencia y multiplicadores de nivel.',
    battle_overhaul_fth_desc: 'Desata Daño Sagrado y bonos divinos.',
    battle_overhaul_summary: 'Tus 6 estadísticas RPG y tu Nivel Global ahora se combinan para calcular daños masivos. ¡Los niveles altos pueden infligir más de 100 de daño por repetición!',
    battle_overhaul_boss_hint: 'Los bosses se han fortalecido para igualar tu nuevo poder.',
    battle_overhaul_btn: 'ENTRAR EN BATALLA',
    stat_str: 'FUERZA',
    stat_dex: 'DESTREZA',
    stat_end: 'RESISTENCIA',
    stat_vig: 'VIGOR',
    stat_int: 'INTELECTO',
    stat_fth: 'FE',
    
    battle_help_title1: 'Impacto Estadístico',
    battle_help_desc1: 'Tu Fuerza (STR) y Nivel ahora multiplican tu daño. Los atletas más fuertes infligen más daño por rep.',
    battle_help_title2: 'Varianza Crítica',
    battle_help_desc2: 'Tu Agilidad (AGI) aumenta la probabilidad de Críticos, mientras que el Poder (PWR) aumenta su daño.',
    boss_status: 'Estado del Boss',
    btn_cancel: 'Cancelar',
    btn_confirm: 'Confirmar',
    battle_overhaul_boss_alert: 'AUMENTO DE VIDA DE BOSS x10',
    codex_close: 'Cerrar Protocolo',

    // New common buttons
    btn_save: 'Guardar Cambios',
    btn_acquired: 'Adquirido',
    btn_acquire: 'Adquirir',
    btn_get: 'Obtener',
    btn_equip: 'Equipar',
    btn_on: 'Activado',
    btn_activate: 'Activar',
    consumable_activated: 'Potenciador Activado',
    damage_boost: 'Bono de Daño',
    settings_title: 'Ajustes de Perfil',
    settings_success: 'Ajustes de perfil actualizados con éxito.',
    settings_error: 'Error al actualizar los ajustes.',

    // Profile specific
    profile_decrypting: 'DESCRIPTANDO PERFIL...',
    profile_recruit: 'RECLUTA',
    profile_xp_to_next: 'XP PARA SIG. NIVEL',
    profile_reward_protocol: '🎁 PROTOCOLO DE RECOMPENSA',
    profile_reward_desc: 'Los cofres de recompensa por subir de nivel se añaden automáticamente al inventario.',
    profile_activity_audit: 'AUDITORÍA DE ACTIVIDAD',
    profile_rc_history: 'HISTORIAL DE REPPY COINS',
    profile_no_transactions: 'SIN_TRANSACCIONES_REGISTRADAS',
    profile_load_more: 'CARGAR MÁS TRANSACCIONES',
    profile_loading: 'COMUNICANDO...',
    blog_xp_gained: '¡Conocimiento adquirido! +100 XP de INT ganada.',
    intelecto_adquirido: 'INTELECTO ADQUIRIDO',
    blog_read_congrats: 'Protocolo completado: Intelecto aumentado.',

    // Shop specific
    shop_armory_title: 'ARMERÍA',
    shop_armory_subtitle: 'Equipa a tu leyenda con cosméticos de protocolo de élite.',
    shop_reppy_coins: 'REPPY COINS',
    shop_elite_pack: 'ELITE_PACK',
    shop_special_deal: 'Oferta Especial',
    shop_permanent_protocol: 'PROTOCOLO PERMANENTE',
    shop_screen_preview: 'VISTA.SCRN',
    shop_post_preview: 'VISTA.POST',
    shop_decrypt_at: 'DESCIFRAR EN',
    shop_module_contents: 'CONTENIDO_MÓDULO',
    shop_bundle_cost: 'COSTE_PACK',
    shop_initiate_acquisition: 'INICIAR ADQUISICIÓN',

    // Roulette
    roulette_exe_available: 'ROULETTE.EXE DISPONIBLE',
    feat_yield_title: 'RENDIMIENTO EXCEPCIONAL',
    boss_anomaly: 'ANOMALÍAS DE BOSS',
    monthly_projection: 'PROYECCIÓN MENSUAL',
    active_yield_desc: 'RENDIMIENTO OPERATIVO ACTIVO',
    profile_loading: 'COMUNICACIÓN...',
    feat_heatmap_title: 'MAPA DE CALOR DE DISTRIBUCIÓN',
    stats_active_days: 'Activo 365 Días',

    // Social & Community
    community: 'COMUNIDAD',
    community_subtitle: 'SINCRONIZA CON LA ÉLITE.',
    social_wall: 'MURO SOCIAL',
    rankings: 'CLASIFICACIONES',
    global_rankings: 'CLASIFICACIONES GLOBALES',
    find_operatives: 'BUSCAR OPERATIVOS',
    inner_circle: 'CÍRCULO INTERNO',
    reps_collected: 'REPS COLECTADAS',
    reps_scaled: 'REPS ESCALADAS',
    protocol_label: 'Protocolo',
    live_sync: 'SINCRONIZACIÓN DE RANGOS EN VIVO',
    friend_added: '¡Amigo añadido con éxito!',
    friend_add_failed: 'Error al añadir amigo',

    // Landing Page
    landing_hero_title: 'DOMINA CADA',
    landing_hero_span: 'REPETICIÓN',
    landing_hero_subtitle: 'La primera plataforma de calistenia con sistema RPG. Cada dominada cuenta. Cada boss cae. Tu leyenda empieza hoy.',
    btn_join_now: 'UNIRSE AHORA',
    btn_continue_adventure: 'CONTINUAR AVENTURA',
    landing_stats_reps: 'Repeticiones',
    landing_stats_bosses: 'Bosses Derrotados',
    landing_stats_cost: 'Sin Coste',
    landing_stats_score: 'Puntuación',
    landing_bento_rpg_title: 'SISTEMA RPG INTEGRADO',
    landing_bento_rpg_desc: 'Sube de nivel tus 6 atributos RPG (STR, DEX, END, VIG, INT, FTH) con cada repetición. Desbloquea cosméticos exclusivos y demuestra tu estatus.',
    landing_bento_ranking_title: 'RANKING MUNDIAL',
    landing_bento_ranking_desc: 'Compite por el Top 1 en la clasificación global.',
    landing_bento_consistency_title: 'CONSISTENCIA',
    landing_bento_community_title: 'COMUNIDAD',
    landing_guia_title: 'Guía Completa para Progresar en Calistenia',
    landing_guia_subtitle: 'Todo lo que necesitas saber sobre el entrenamiento de peso corporal',
    landing_final_cta_title: 'Empieza tu leyenda hoy',
    landing_final_cta_desc: 'Únete a la comunidad de calistenia de Reppy. Registra flexiones, fondos y muscle ups. 100% gratis, para siempre.',
    btn_create_account_free: 'Crea tu cuenta gratis para siempre',

    // Landing Article
    landing_art_intro_title: 'Introducción al Street Workout',
    landing_art_intro_p1: 'La calistenia, también conocida como street workout, es una disciplina milenaria que se centra en el uso exclusivo del propio peso corporal para ganar fuerza, agilidad y control muscular. A diferencia del entrenamiento con pesas convencional, la calistenia requiere una coordinación intermuscular brutal y una fuerza relativa excepcional.',
    landing_art_intro_p2: 'En los últimos años, la popularidad de este deporte ha explotado gracias a su accesibilidad. Todo lo que necesitas es una barra de dominadas y voluntad. Sin embargo, esta simplicidad es un arma de doble filo: es muy fácil perderse en la rutina y no ver resultados si no se lleva un registro estricto. Aquí es donde un tracker de calistenia como Reppy marca la diferencia.',
    landing_art_pullups_title: 'Dominando la Barra: El Camino del Pull-Up',
    landing_art_pullups_p1: 'Las dominadas son, sin duda, el ejercicio rey de la calistenia para el tren superior. Involucran el dorsal ancho, los trapecios, los romboides, los bíceps y, por supuesto, el core. Realizar tu primera dominada es el rito de iniciación de cualquier atleta. Pero, ¿cómo pasar de 1 a 10, o de 10 a 20?',
    landing_art_pullups_p2: 'La clave reside en el volumen total de entrenamiento. No busques el fallo muscular en cada serie. En su lugar, realiza múltiples series dejando 1 o 2 repeticiones en recámara (RPE 8). Al usar Reppy para contar tus dominadas, podrás ver que sumando pequeñas series a lo largo del día o del entrenamiento, tu volumen total semanal aumenta drásticamente. Esta acumulación de fatiga controlada es lo que genera las adaptaciones neurales y musculares necesarias para progresar.',
    landing_art_psych_title: 'La Psicología del Fitness: Gamificación',
    landing_art_psych_p1: '¿Por qué nos cuesta tanto ir a entrenar pero podemos pasar horas subiendo de nivel en un videojuego? La respuesta está en el bucle de retroalimentación inmediata. En el gimnasio, los resultados tardan meses en verse. En un RPG, ves tu barra de experiencia subir tras cada combate.',
    landing_art_psych_p2: 'En Reppy hemos hackeado este sistema. Al convertir cada flexión de brazos y cada dominada en "daño" infligido a un boss o en experiencia para tu personaje, creamos una satisfacción inmediata que mantiene tu motivación por las nubes. Ya no entrenas solo por tu salud física, sino para que tu perfil de atleta refleje el esfuerzo que estás poniendo. Este componente social y gamificado reduce la tasa de abandono en más de un 60% según nuestros estudios internos de comunidad.',
    landing_art_nutri_title: 'Nutrición y Descanso en Calistenia',
    landing_art_nutri_p1: 'Ningún contador de repeticiones podrá salvarte si no descansas y te alimentas correctamente. El tejido muscular se daña durante el entrenamiento y se repara (crecer) durante el sueño. Asegúrate de consumir al menos 1.8g de proteína por kilo de peso y de dormir entre 7 y 9 horas diarias.',
    landing_art_nutri_p2: 'Recuerda que en calistenia, el peso corporal es tu resistencia. Si ganas grasa innecesaria, tus dominadas se volverán más difíciles. Mantener un superávit calórico ligero pero controlado es ideal para ganar fuerza sin sacrificar tu movilidad (DEX) en la barra. Usa las monedas que ganes en Reppy como un recordatorio de que el esfuerzo tiene recompensa, tanto virtual como física.',
    landing_art_concl_title: 'Conclusión: El Futuro de tu Entrenamiento',
    landing_art_concl_p1: 'El camino hacia un cuerpo fuerte y funcional no tiene atajos, pero sí herramientas que lo hacen más llevadero. Reppy no es solo una aplicación; es tu compañero de barras, tu registro de vida y tu comunidad. Ya seas un principiante buscando su primera flexión o un experto buscando el Top 1 en el ranking de muscle ups, estamos aquí para contar cada una de tus victorias.',
    landing_art_concl_p2: 'Se acabó el entrenar a ciegas. Es hora de jugar en serio. Es hora de Reppy.',

    // Landing Features
    landing_feat_heatmap_title: 'Heatmap de Actividad',
    landing_feat_heatmap_desc: 'Visualiza tu consistencia de entrenamiento con un gráfico estilo GitHub. Ve de un vistazo qué días entrenaste dominadas, flexiones o fondos. Filtra por ejercicio y año completo.',
    landing_feat_rankings_title: 'Rankings Globales',
    landing_feat_rankings_desc: 'Compite en el ranking mundial de dominadas y calistenia. Filtra por hoy, semana, mes o total. Sube de posición y demuestra quién es el mejor.',
    landing_feat_social_title: 'Comunidad Social',
    landing_feat_social_desc: 'Añade amigos, visita sus perfiles públicos y compara tu progreso de calistenia. Crea tu círculo de entrenamiento y mantén la motivación.',
    
    // Boss Fights
    landing_boss_title: 'Boss Fights Comunitarios',
    landing_boss_desc: 'Participate en eventos globales donde toda la comunidad lucha contra un boss épico. Cada dominada, flexión o fondo que registras inflige daño. Cuando la comunidad lo derrota, todos ganan cofres con recompensas legendarias.',
    landing_boss_how: '¿Cómo funcionan?',
    landing_boss_step1_title: 'Aparece un Boss',
    landing_boss_step1_desc: 'Un boss con miles de puntos de vida aparece durante un evento temporal. Toda la comunidad puede participar.',
    landing_boss_step2_title: 'Registra Repeticiones',
    landing_boss_step2_desc: 'Cada dominada, flexión o fondo que haces inflige daño al boss. Ve la barra de vida bajar en tiempo real.',
    landing_boss_step3_title: 'Gana Recompensas',
    landing_boss_step3_desc: 'Cuando el boss cae, todos los participantes desbloquean cofres con títulos, marcos de avatar y efectos exclusivos.',

    // How to Use
    landing_how_title: 'Cómo funciona',
    landing_how_subtitle: 'Empieza a contar tus dominadas y flexiones en 3 pasos',
    landing_how_step1_title: 'Regístrate con Google',
    landing_how_step1_desc: 'Sin contraseña, sin complicaciones. Un clic con tu cuenta de Google y ya estás dentro.',
    landing_how_step2_title: 'Registra tus Repeticiones',
    landing_how_step2_desc: 'Selecciona dominadas, flexiones, fondos o muscle ups. Pon el número y dale a añadir. Ya cuentan.',
    landing_how_step3_title: 'Compite y Sube de Nivel',
    landing_how_step3_desc: 'Gana monedas, sube tu ranking global, compra cosméticos en la tienda y derrota bosses con la comunidad.',

    // FAQ & LB
    landing_faq_title: 'Preguntas Frecuentes',
    landing_lb_title_main: 'Clasificación Global',
    landing_lb_subtitle_main: 'Ranking de dominadas y calistenia en tiempo real',
    landing_lb_live: 'LIVE RANKING',
    landing_lb_preparing: 'Preparando Ranking...',
    landing_lb_join: 'UNIRSE AL RANKING',
    landing_footer_copy: 'REPPY © 2026',
    landing_footer_free: 'App de Calistenia Gratuita',
    landing_footer_exercises: 'Dominadas · Flexiones · Fondos',
    landing_footer_desc: 'Reppy es un tracker de calistenia con sistema RPG para registrar dominadas, flexiones, fondos, muscle ups y dominadas con lastre. Disponible en español e inglés.',
    cat_consumable: 'Consumibles',

    // Additional Shop/UI
    shop_seasonal_title: 'PROTOCOLO ESTACIONAL',
    shop_seasonal_subtitle: 'Recompensas de eventos especiales y artefactos de hitos.',
    shop_stock: 'STOCK',
    shop_event_badge: 'EVENTO',
    shop_special_badge: 'ESPECIAL',
    shop_seasonal_badge: 'ESTACIONAL',
    shop_unit_page: 'PÁGINA_UNIDAD',
    shop_total_chunks: 'BLOQUES_TOTALES',
    shop_tab_post_backgrounds: 'MURO',

    // Additional Inventory
    inv_title: 'INVENTARIO.RPG',
    inv_subtitle: 'Gestiona tus atributos y equipamiento',
    inv_tab_stats: 'ATRIBUTOS',
    inv_tab_gear: 'EQUIPO',
    inv_level_card_title: 'Nivel de Personaje',
    inv_level_card_subtitle: 'Sube de nivel para ganar cofres y poder destructivo',
    inv_next_level: 'SIGUIENTE NIVEL',
    inv_empty_title: 'Armería Vacía',
    inv_empty_desc: 'Derrota bosses para obtener equipo legendario',
    inv_level_chest: 'COFRE DE NIVEL',
    inv_boss_chest: 'COFRE MECÁNICO',
    inv_xp_left: 'RESTANTE',
    xp_label: 'XP',
    inv_available: 'DISPONIBLES',
    inv_new_badge: 'NUEVO',
    inv_cat_titles: 'Títulos',
    inv_cat_borders: 'MARCOS',
    inv_cat_backgrounds: 'Fondos',
    inv_cat_post_backgrounds: 'FONDOS DE MURO',
    inv_cat_avatar_effects: 'EFECTOS DE AVATAR',
    inv_cat_consumables: 'CONSUMIBLES',
    inv_dismiss_data: 'DESCARTAR DATOS',

    // Additional Dashboard
    dash_global_view_active: 'Vista global activa. Selecciona un protocolo para registrar volumen.',
    dash_boss_status: 'Estado del Boss',
    dash_goal_achieved: 'Meta conseguida.',
    dash_analyzing_performance: 'Analizando rendimiento...',
    dash_streak: 'Racha',
    dash_peak_volume: 'Volumen Pico',
    dash_total_tonnage: 'Tonelaje Total',
    dash_history_title: 'Historial de actividad',
    dash_tons_moved: 'TONS MOVIMIENTOS',
    dash_protocol_null: 'Protocolo Nulo',

    // Reps Input
    rep_protocol_active: 'Protocolo {type} activo',
    rep_manual_entry: 'Entrada manual',
    rep_additional_weight: 'Carga adicional (Kg)',

    // Boss
    battle_history: 'Historial de Batalla',
    boss_dmg_label: 'DMG',
    boss_damage_active: 'DAÑO ACTIVO',
    boss_assault: 'ASALTO AL BOSS',

    // Activity Card
    activity_level_label: 'LVL',
    activity_reps_label: 'REPS',
    activity_milestone_msg: '¡{threshold} {exercise} totales!',
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
