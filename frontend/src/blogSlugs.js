// Slugs de blog por idioma: los posts tienen `slug` (ES, canónico) y
// opcionalmente `slugEn` (URL inglesa). OJO: no importar desde código del
// bundle principal (router, App) — blogPosts.json solo debe cargarse en los
// chunks lazy del blog/landing.
import { blogPosts } from './blogPosts';

// URL slug de un post para un idioma dado
export const postSlugFor = (post, lang) =>
  lang === 'en' && post.slugEn ? post.slugEn : post.slug;

// Busca un post por cualquiera de sus slugs (ES o EN)
export const findPostBySlug = (slug) =>
  blogPosts.find(p => p.slug === slug || p.slugEn === slug);
