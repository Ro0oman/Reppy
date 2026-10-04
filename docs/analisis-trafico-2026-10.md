# Análisis de tráfico y medición — 2026-10-04

Alcance: lo que se puede comprobar **leyendo el repositorio**. No he tenido acceso a Google Analytics,
Search Console ni Bing, así que lo que depende de esas consolas queda marcado como «por comprobar» y
con los pasos exactos. Contexto: 0 clics desde Google y Bing en tres meses, 6 de 154 páginas indexadas,
93 usuarios, 29 con alguna rep, 1 alta en 30 días.

## 1. Eventos `signup` y `first_log` (por qué GA4 marca 0)

Código: `frontend/src/utils/analytics.js`, enganchado en `main.js` con un interceptor global de axios.

| Evento | Cuándo se dispara | Hallazgo |
|---|---|---|
| `signup` | `POST /auth/signup` correcto | **Las altas con Google no lo disparaban nunca** (`POST /auth/google` no estaba cubierto). Es el camino de registro más usado. Corregido en esta PR: el backend devuelve `is_new_user` y el interceptor lanza `signup {method:'google'}` solo si es alta. |
| `first_log` | primer `POST /reps` correcto, una vez por navegador (`localStorage`) | Bien cableado. Con 1 alta/mes y la mayoría de usuarios ya registrados no hay muchos candidatos, pero debería haber algún evento tras el despliegue. |
| `day2_return`, `spin`, `push_enabled` | ver fichero | Mismo mecanismo. |

Verificación hecha: simulé el interceptor con un adaptador falso de axios y un `gtag` de prueba: un alta
con Google dispara `signup/google`, un login con Google no dispara nada y el registro por email sigue
disparando `signup/password`.

**Por comprobar en GA4** (no puedo hacerlo yo):
1. *Admin → Eventos*: ¿aparecen `first_log` o `signup` con cualquier recuento en 90 días? Si aparecen
   pero no como evento clave, basta con marcarlos (E3).
2. *DebugView* con la extensión «GA Debugger» abierta en una ventana normal: registrar unas reps y mirar
   si llega `first_log`. Si no llega, un bloqueador o la CSP lo impiden.
3. La CSP (`index.html`) permite `connect-src *` e `img-src *`, así que **la CSP no es el problema**.

## 2. Dos IDs de GA4 en `index.html`

`frontend/index.html:144-150` carga `G-TJ4SF4KS8R` y además hace `gtag('config', 'G-3SL67W0LS6')`.
Cada hit se envía a **las dos propiedades**. Si una de ellas es la del portfolio, es la causa de la mezcla
de datos que ya se había observado. Hay que decidir cuál es la de Reppy y quitar la otra (E3: crear una
propiedad solo para Reppy). No lo he tocado: no sé cuál es cuál.

## 3. Redirecciones (`frontend/nginx.conf`)

- La raíz hace 301 a `/es` o `/en` según el idioma, en un solo salto (comentado en el fichero). Bien.
- Hay 301 explícitos para slugs del blog retirados (pike push-ups, dolor de codo, ayuno intermitente…),
  todos de **un salto**. No he encontrado cadenas de dos o más 301 en el fichero.
- **Por comprobar con la red** (necesita el sitio desplegado): `curl -sIL https://reppy.romandev.app/` y
  lo mismo con `/es`, `/es/blog` y una URL antigua, para confirmar que solo hay un salto y que acaba en
  200 con `https`. Lo que ya figuraba como «borrado sin 301» es el dominio viejo (Vercel), que no se ve
  desde el repo.

## 4. Sitemap

Generado por `frontend/scripts/generate-sitemap.js`; hoy: `sitemap-pages.xml` 29 URLs, `sitemap-blog.xml`
86, `sitemap-athletes.xml` 36 (más 3 de índice) = los 154 que cuenta Google.

| Hallazgo | Por qué importa | Propuesta |
|---|---|---|
| `sitemap-pages` y `sitemap-athletes` ponen **el mismo `lastmod` (hora del build) en todas las URL** y se regenera en cada build. | Si todo «cambia» siempre, Google deja de fiarse de `lastmod`. | Usar la fecha real de modificación, o quitar `lastmod` donde no se conozca. |
| 36 URL de **perfiles de atleta** (`/es/atleta/…`) en el sitemap. | Son páginas finas (cifras de un usuario) y casi duplicadas entre idiomas; compiten por el poco presupuesto de rastreo que da un dominio sin autoridad. Probables candidatas a las «rastreadas y descartadas». | Sacarlas del sitemap (siguen accesibles) y volver a meterlas cuando haya perfiles con contenido. |
| `/social` con `changefreq: hourly` y prioridad 0.6. | Es una pantalla dinámica; la frecuencia declarada no es cierta. | Quitar el `changefreq` o la URL. |
| 86 URL de blog (43 artículos × 2 idiomas) frente a 6 indexadas. | El problema no es el sitemap sino la autoridad (ver análisis de SEO ya hecho). | No escribir más artículos hasta tener enlaces entrantes (E5). |

## 5. Canónicas

No he podido comprobar canónicas con el sitio desplegado. `scripts/fix-ssg-seo.js` sobrescribe los
metadatos tras `vite-ssg`. **Por comprobar**: `curl -s https://reppy.romandev.app/es/blog/pike-push-ups-guia-definitiva | grep -i canonical`
debe devolver una única canónica absoluta y autorreferenciada, y lo mismo en `/en/…`.

## 6. Cambios incluidos en esta PR

- `backend/auth.js`: `POST /auth/google` devuelve `is_new_user`.
- `frontend/src/utils/analytics.js`: `signup {method:'google'}` en las altas con Google.

## 7. Siguiente paso recomendado (necesita a Roman)

1. E3: propiedad GA4 solo para Reppy, y quitar el segundo `gtag('config', …)` de `index.html`.
2. Marcar `signup` y `first_log` como eventos clave y comprobarlos con DebugView.
3. Sacar `sitemap-athletes.xml` del índice y arreglar `lastmod` (PR aparte, pequeña).
4. E4/E5: indexación manual de 5–10 páginas y distribución; es lo único que moverá la cifra de visitas.

## 8. Comprobado en las consolas (2026-10-04, con la sesión de Roman en Chrome)

Solo lectura. No he cambiado ningún ajuste en Analytics, Search Console ni Bing.

### Google Analytics (propiedad `romandev`, cuenta `a254797088`)
- **Es la misma propiedad que el portfolio.** En «Vistas por título de página» salen juntos «Comunidad | Reppy», «Entrenar | Reppy» y «Roman Myziuk — Full Stack Web Developer». Confirma lo que ya se sospechaba por los dos `gtag('config')` de `index.html`: no hay propiedad solo para Reppy.
- Últimos 7 días: **5 usuarios activos, 2 nuevos, 50 eventos, 0 eventos clave**; sesiones 11 «Direct» y 1 sin asignar; **ninguna** desde buscadores ni referidos. Países: España, Alemania, Singapur, EE. UU. (Ashburn y Singapur son casi seguro rastreadores).
- No he podido abrir la lista de eventos (la interfaz de administración no cargó por enlace directo), así que **sigue sin comprobarse si `signup` o `first_log` llegan**; hay 0 eventos clave porque no están marcados como tales. Pendiente de Roman: *Administrar → Eventos*.

### Search Console (`https://reppy.romandev.app/`)
- **0 clics** en la búsqueda web. Indexación: **6 indexadas, 148 no indexadas**.
- Motivos de las 148: *Descubierta, sin indexar* **122**; *Rastreada, sin indexar* **22**; *Duplicada, canónica distinta* 2; *Bloqueada por robots.txt* 1; *Página con redirección* 1.
- Entre las 22 «rastreadas pero descartadas» están **la portada (`/`, `/es`, `/en`)**, `/es/social`, `/en/contador-dominadas`, `/es/contador-dominadas` y varios artículos del blog. Que Google rastree la portada y decida no indexarla es la señal de autoridad baja: no hay enlaces entrantes que justifiquen gastar presupuesto de rastreo.
- Las 122 «descubiertas» son las que ni ha rastreado (sitemap de 151 URL).

### Bing Webmaster
- El enlace abierto era la propiedad **`reppy-weld.vercel.app`, el dominio viejo de Vercel** («usuario no autorizado»). Es normal que ahí no haya datos.
- La propiedad correcta, **`reppy.romandev.app`, sí existe**: sitemap índice enviado el 26/07 y rastreado el 02/10 con éxito, **137 URL descubiertas**, 0 errores y 0 avisos. Bing no es el cuello de botella.

### Conclusión
Los tres cuadran con el diagnóstico anterior: **problema de autoridad y distribución, no técnico**. Lo único accionable en código ya está en #377 (evento `signup` de Google) y en las propuestas de la sección 4 (sacar los 36 perfiles de atleta del sitemap, arreglar `lastmod`). Lo que mueve la aguja es lo de E4/E5: enlaces entrantes y distribución.

### Para Roman, en este orden
1. Quitar el segundo `gtag('config')` y crear una propiedad GA4 solo para Reppy (sigue mezclado con el portfolio).
2. En *Eventos*, comprobar si aparecen `signup` y `first_log` y marcarlos como clave.
3. En Bing, quitar la propiedad vieja `reppy-weld.vercel.app` si ya no sirve.
4. En Search Console, pedir indexación manual de las 5–10 mejores páginas, empezando por la guía de pike push-ups.
