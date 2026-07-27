// Índice ligero del blog: mismos campos que `blogPosts` PERO sin el cuerpo
// markdown (`locales.*.content`). Úsalo en cualquier vista que solo pinte
// tarjetas/listados (Landing, BlogList, Codex).
//
// Para leer un post entero sigue haciendo falta `@/blogPosts` — solo BlogView
// debería importarlo, para que el corpus completo no entre en el bundle de las
// páginas públicas. Lo genera `scripts/generate-blog-index.js` en el build.
import blogIndexData from './blogIndex.json';

export const blogPosts = blogIndexData;
export default blogIndexData;
