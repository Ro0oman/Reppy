// Source of Truth for Blog Posts (Frontend Static Bundle)
// Sync with backend/blogData.json
//
// OJO: esto incluye el cuerpo markdown completo de los 44 posts (~340 KB). Solo
// debe importarlo `BlogView`, que es donde se lee un post. Para listados y
// tarjetas usa `@/blogIndex`, que es el mismo dataset sin los cuerpos.
import blogPostsData from './blogPosts.json';

export const blogPosts = blogPostsData;

// Busca un post por cualquiera de sus slugs (ES o EN). Necesita el corpus, así
// que vive aquí y no en `blogSlugs.js` (que debe seguir libre de datos).
export const findPostBySlug = (slug) =>
  blogPostsData.find(p => p.slug === slug || p.slugEn === slug);
