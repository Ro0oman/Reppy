import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// GET /api/exercises
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM exercises WHERE is_active = TRUE ORDER BY title_key ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Error fetching exercises' });
  }
});

// GET /api/exercises/favorites
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT e.*, uf.position 
       FROM user_favorite_exercises uf
       JOIN exercises e ON uf.exercise_slug = e.slug
       WHERE uf.user_id = $1
       ORDER BY uf.position ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favorite exercises:', error);
    res.status(500).json({ message: 'Error fetching favorite exercises' });
  }
});

// PUT /api/exercises/favorites
router.put('/favorites', authenticate, async (req, res) => {
  const { slugs } = req.body;

  if (!Array.isArray(slugs)) {
    return res.status(400).json({ message: 'Slugs must be an array' });
  }
  if (slugs.length > 6) {
    return res.status(400).json({ message: 'Maximum of 6 favorites allowed' });
  }

  try {
    await query('BEGIN');

    // 1. Delete all existing favorites for user
    await query('DELETE FROM user_favorite_exercises WHERE user_id = $1', [req.user.id]);

    // 2. Insert new favorites
    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i];
      // Verify exercise exists and is active
      const checkEx = await query('SELECT 1 FROM exercises WHERE slug = $1 AND is_active = TRUE', [slug]);
      if (checkEx.rows.length === 0) {
        throw new Error(`Exercise ${slug} does not exist or is inactive`);
      }

      await query(
        `INSERT INTO user_favorite_exercises (user_id, exercise_slug, position)
         VALUES ($1, $2, $3)`,
        [req.user.id, slug, i]
      );
    }

    await query('COMMIT');
    res.json({ message: 'Favorites updated successfully' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating favorites:', error);
    res.status(500).json({ message: error.message || 'Error updating favorites' });
  }
});

// GET /api/exercises/:slug/progress
router.get('/:slug/progress', authenticate, async (req, res) => {
  const { slug } = req.params;
  const userId = req.user.id;

  try {
    const exerciseRes = await query(
      `SELECT * FROM exercises WHERE slug = $1`,
      [slug]
    );
    if (exerciseRes.rows.length === 0) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    const exercise = exerciseRes.rows[0];

    const progressRes = await query(
      `SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, SUM(count)::int as total
       FROM reps
       WHERE user_id = $1 AND exercise_type = $2 AND TO_CHAR(date, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
       GROUP BY date
       ORDER BY date ASC`,
      [userId, slug]
    );

    res.json({
      ...exercise,
      progress: progressRes.rows
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Error fetching progress' });
  }
});

// POST /api/exercises
router.post('/', authenticate, async (req, res) => {
  const { title, unit, difficulty_multiplier, coin_multiplier } = req.body;

  if (!title || !unit) {
    return res.status(400).json({ message: 'Title and unit are required' });
  }

  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!baseSlug) {
    return res.status(400).json({ message: 'Invalid title for creating slug' });
  }

  try {
    const existing = await query('SELECT slug FROM exercises WHERE slug = $1', [baseSlug]);
    let finalSlug = baseSlug;
    if (existing.rows.length > 0) {
      finalSlug = `${baseSlug}_${Date.now()}`;
    }

    const titleKey = title;
    const descriptionKey = `Custom exercise created by user`;

    const result = await query(
      `INSERT INTO exercises (slug, title_key, description_key, unit, difficulty_multiplier, coin_multiplier, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING *`,
      [finalSlug, titleKey, descriptionKey, unit, Number(difficulty_multiplier || 1), Number(coin_multiplier || 1)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ message: 'Error creating exercise' });
  }
});

export default router;
