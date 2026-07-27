// Genera `src/blogIndex.json`: el mismo dataset del blog PERO sin el cuerpo
// markdown de los posts (`locales.*.content`), que es el ~95% del peso.
//
// Por qué: las vistas que solo pintan tarjetas (Landing, BlogList, Codex) hacían
// `import ... from '@/blogPosts'`, y ese import estático arrastraba el chunk
// entero (~250 KB) hasta la landing pública `/es` — la entrada nº1 de SEO — solo
// para leer título, fecha e imagen. El cuerpo completo solo hace falta en
// `BlogView`, que es donde se lee el post.
//
// Se ejecuta en el `build` justo detrás de `sync-blog`. El resultado se versiona
// para que `vite dev` funcione sin tener que correr el script a mano.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.join(__dirname, '..', 'src', 'blogPosts.json');
const OUT = path.join(__dirname, '..', 'src', 'blogIndex.json');

const posts = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const index = posts.map((post) => ({
  ...post,
  locales: Object.fromEntries(
    Object.entries(post.locales || {}).map(([lang, data]) => {
      const { content, ...rest } = data;
      return [lang, rest];
    })
  ),
}));

fs.writeFileSync(OUT, JSON.stringify(index));

const kb = (file) => Math.round(fs.statSync(file).size / 1024);
console.log(`[blog-index] ${posts.length} posts · ${kb(SRC)} KB → ${kb(OUT)} KB`);
