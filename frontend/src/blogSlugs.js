// Helpers de slug de blog. Los posts tienen `slug` (ES, canónico) y
// opcionalmente `slugEn` (URL inglesa).
//
// IMPORTANTE: este módulo NO debe importar `blogPosts` ni `blogIndex`. Lo
// consumen Landing, BlogList y Codex, así que cualquier import de datos aquí
// arrastraría el dataset del blog al bundle de la landing pública. `postSlugFor`
// es una función pura sobre el objeto post que ya tiene quien la llama.
// La búsqueda por slug (que sí necesita el corpus) vive en `blogPosts.js`.

// URL slug de un post para un idioma dado
export const postSlugFor = (post, lang) =>
  lang === 'en' && post.slugEn ? post.slugEn : post.slug;
