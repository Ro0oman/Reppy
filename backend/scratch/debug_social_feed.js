import pool from '../db.js';

async function testQuery() {
  const userId = 'some_user_id'; // Doesn't matter for syntax check
  const offset = 0;
  const filter = 'global';
  
  let whereClause = '';
  const params = [userId, offset];

  const queryText = `
      WITH daily_stats AS (
        SELECT 
          user_id, 
          date, 
          SUM(count)::int as day_reps,
          SUM(boss_damage_dealt)::int as day_damage
        FROM reps
        GROUP BY user_id, date
      ),
      reps_feed AS (
        SELECT 
            u.id as user_id,
            u.name as user_name,
            u.avatar_url,
            u.current_level,
            u.total_reps,
            u.str_xp, u.end_xp, u.agi_xp, u.dex_xp, u.vig_xp, u.int_xp, u.fth_xp,
            b.css_value as border_css,
            a.css_value as avatar_css,
            pb.css_value as post_background_css,
            TO_CHAR(r.date, 'YYYY-MM-DD') as date,
            ds.id as summary_id,
            ds.title,
            ds.description,
            u.cha_xp,
            t.name as title_name,
            (SELECT name FROM boss_fights bf WHERE bf.id = MAX(r.boss_fight_id)) as boss_name,
            (SELECT image_url FROM boss_fights bf WHERE bf.id = MAX(r.boss_fight_id)) as boss_image,
            JSON_AGG(JSON_BUILD_OBJECT(
                'exercise_type', r.exercise_type,
                'count', r.count,
                'is_crit', COALESCE(r.is_crit, false),
                'boss_damage', r.boss_damage_dealt,
                'base_damage', r.base_damage,
                'gear_bonus', r.gear_bonus,
                'buff_bonus', r.buff_bonus,
                'active_multiplier', r.active_multiplier,
                'is_pr', NOT EXISTS (
                    SELECT 1 FROM reps r_old 
                    WHERE r_old.user_id = u.id 
                    AND r_old.exercise_type = r.exercise_type 
                    AND r_old.date < r.date 
                    AND r_old.count >= r.count
                )
            )) as exercises,
            JSON_BUILD_OBJECT(
                'head', JSON_BUILD_OBJECT('name', iHead.name, 'rarity', iHead.rarity),
                'weapon', JSON_BUILD_OBJECT('name', iWeapon.name, 'rarity', iWeapon.rarity),
                'armor', JSON_BUILD_OBJECT('name', iArmor.name, 'rarity', iArmor.rarity),
                'boots', JSON_BUILD_OBJECT('name', iBoots.name, 'rarity', iBoots.rarity)
            ) as equipment,
            (SELECT COUNT(*) FROM summary_interactions WHERE summary_id = ds.id AND type = 'LIKE') as like_count,
            (SELECT COUNT(*) FROM summary_interactions WHERE summary_id = ds.id AND type = 'COMMENT') as comment_count,
            EXISTS(SELECT 1 FROM summary_interactions WHERE summary_id = ds.id AND user_id = $1 AND type = 'LIKE') as user_has_liked,
            MAX(r.created_at) as created_at,
            'reps' as post_type,
            NULL::json as pvp_data
        FROM reps r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN daily_summaries ds ON ds.user_id = r.user_id AND ds.date::date = r.date::date
        LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
        LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
        LEFT JOIN cosmetics pb ON u.equipped_post_background_id = pb.id
        LEFT JOIN cosmetics t ON u.equipped_title_id = t.id
        LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
        LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
        LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
        LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
        ${whereClause}
        GROUP BY 
          u.id, r.date, ds.id, ds.title, ds.description,
          b.css_value, a.css_value, pb.css_value, t.name,
          u.name, u.avatar_url, u.current_level, u.total_reps, u.cha_xp,
          iHead.name, iHead.rarity, iWeapon.name, iWeapon.rarity, iArmor.name, iArmor.rarity, iBoots.name, iBoots.rarity
      ),
      pvp_feed AS (
        SELECT 
            u1.id as user_id,
            u1.name as user_name,
            u1.avatar_url,
            u1.current_level,
            u1.total_reps,
            u1.str_xp, u1.end_xp, u1.agi_xp, u1.dex_xp, u1.vig_xp, u1.int_xp, u1.fth_xp,
            b.css_value as border_css,
            NULL as avatar_css,
            NULL as post_background_css,
            TO_CHAR(f.created_at, 'YYYY-MM-DD') as date,
            NULL::int as summary_id,
            CASE WHEN f.status = 'active' THEN 'COMBATE EN VIVO ⚔' ELSE 'COMBATE FINALIZADO ⚔' END as title,
            u1.name || ' vs ' || u2.name as description,
            u1.cha_xp,
            t.name as title_name,
            NULL as boss_name,
            NULL as boss_image,
            '[]'::json as exercises,
            '{}'::json as equipment,
            0::bigint as like_count,
            0::bigint as comment_count,
            false as user_has_liked,
            f.created_at as created_at,
            'pvp' as post_type,
            JSON_BUILD_OBJECT(
                'id', f.id,
                'challenger_id', f.challenger_id,
                'challenged_id', f.challenged_id,
                'challenger_name', u1.name,
                'challenged_name', u2.name,
                'status', f.status,
                'winner_id', f.winner_id,
                'damage1', f.damage1,
                'damage2', f.damage2,
                'hp1', f.hp1,
                'hp2', f.hp2,
                'max_hp', f.max_hp,
                'started_at', f.started_at,
                'time_limit', f.time_limit
            ) as pvp_data
        FROM pvp_fights f
        JOIN users u1 ON f.challenger_id = u1.id
        JOIN users u2 ON f.challenged_id = u2.id
        LEFT JOIN cosmetics b ON u1.equipped_border_id = b.id
        LEFT JOIN cosmetics t ON u1.equipped_title_id = t.id
        WHERE f.status != 'pending'
      ),
      feed_base AS (
        SELECT * FROM reps_feed
        UNION ALL
        SELECT * FROM pvp_feed
      )
      SELECT 
        f.*,
        COALESCE(EXISTS (SELECT 1 FROM reps rc WHERE rc.user_id = f.user_id AND rc.date = f.date::date AND rc.is_crit = true), false) as has_crit,
        COALESCE((SELECT SUM(count) FROM reps WHERE user_id = f.user_id AND date = f.date::date), 0) as total_reps_today,
        COALESCE((SELECT SUM(boss_damage_dealt) FROM reps WHERE user_id = f.user_id AND date = f.date::date), 0) as total_damage_today,
        -- Dominant stat calculation
        (SELECT 
            CASE 
                WHEN GREATEST(str_xp, end_xp, agi_xp) = str_xp THEN 'str'
                WHEN GREATEST(str_xp, end_xp, agi_xp) = end_xp THEN 'end'
                ELSE 'agi'
            END
         FROM users WHERE id = f.user_id
        ) as dominant_stat,
        (SELECT COUNT(*) FROM users u2 WHERE u2.total_reps > f.total_reps AND u2.is_private = false) + 1 as global_rank,
        -- Rivalry: Find user just above in rank
        (SELECT JSON_BUILD_OBJECT('name', u_rival.name, 'reps_diff', u_rival.total_reps - f.total_reps)
         FROM users u_rival 
         WHERE u_rival.total_reps > f.total_reps AND u_rival.is_private = false
         ORDER BY u_rival.total_reps ASC LIMIT 1
         ) as next_rank_rival,
        COALESCE(EXISTS (
          SELECT 1 FROM daily_stats ds_pb WHERE ds_pb.user_id = f.user_id AND ds_pb.date < f.date::date
          HAVING (SELECT SUM(count) FROM reps WHERE user_id = f.user_id AND date = f.date::date) > COALESCE(MAX(ds_pb.day_reps), 0)
        ), false) as is_personal_best,
        COALESCE((
          WITH RECURSIVE streak_calc AS (
            SELECT f.date::date as streak_date
            UNION
            SELECT (sc.streak_date - INTERVAL '1 day')::date
            FROM streak_calc sc
            JOIN daily_stats ds ON ds.user_id = f.user_id AND ds.date = (sc.streak_date - INTERVAL '1 day')::date
          )
          SELECT COUNT(*) FROM streak_calc
        ), 0) as real_streak,
        (
          SELECT JSON_AGG(r_stats) FROM (
            SELECT exercise_type, rank
            FROM (
              SELECT exercise_type, user_id, 
                     RANK() OVER(PARTITION BY exercise_type ORDER BY SUM(count) DESC) as rank
              FROM reps
              GROUP BY exercise_type, user_id
            ) all_ranks
            WHERE user_id = f.user_id AND rank <= 10
            LIMIT 3
          ) r_stats
        ) as exercise_ranks
      FROM feed_base f
      ORDER BY f.created_at DESC
      LIMIT 10 OFFSET $2
  `;

  try {
    await pool.query(queryText, params);
    console.log('Query successful');
  } catch (e) {
    console.error('Query failed:', e.message);
  } finally {
    process.exit(0);
  }
}

testQuery();
