// Buffer de diagnóstico para poder copiar logs desde el móvil cuando algo falla.
//
// El parche de `console.error`/`console.warn` es la fuente principal y funciona
// también en producción (`vite.config.js` declara `esbuild.drop = ['console']`,
// pero el proyecto compila con Rolldown, que ignora esa opción: las ~90 llamadas
// a console siguen en el bundle). Aun así el parche solo ve lo que alguien se
// acordó de pasar por console, y de un error de axios captura el `Error` genérico
// ("Request failed with status code 500") SIN el cuerpo de la respuesta, que es
// justo lo que dice qué ha fallado. Por eso se añaden tres fuentes más:
//
//   1. Interceptor de axios — status y CUERPO de cada respuesta HTTP fallida.
//   2. `logError()` / `logInfo()` — llamadas explícitas desde los catch.
//   3. `window.onerror` y `unhandledrejection` — lo que no pasa por ningún catch.

const MAX_LOGS = 200;
let logs = [];
let notificationStore = null;
let isLogging = false;

const addLog = (level, message) => {
  const timestamp = new Date().toISOString();
  const sanitizedMessage = message.length > 10000
    ? message.substring(0, 10000) + '... [TRUNCATED]'
    : message;
  logs.push(`[${timestamp}] [${level}] ${sanitizedMessage}`);
  if (logs.length > MAX_LOGS) logs.shift();
};

const stringify = (arg) => {
  if (arg instanceof Error) return arg.stack || `${arg.name}: ${arg.message}`;
  if (typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch (e) {
      return '[Object non-serializable]';
    }
  }
  return String(arg);
};

// API explícita: úsala en los catch en lugar de (o además de) console.error, que
// en producción no existe.
export const logError = (...args) => addLog('ERROR', args.map(stringify).join(' '));
export const logInfo = (...args) => addLog('INFO', args.map(stringify).join(' '));

// Registra una petición HTTP fallida con todo lo que hace falta para diagnosticar:
// método, URL, status y cuerpo de la respuesta del backend.
const logAxiosError = (error) => {
  const cfg = error?.config || {};
  const method = (cfg.method || '?').toUpperCase();
  const url = cfg.url || '?';
  if (error?.response) {
    const { status, statusText, data } = error.response;
    addLog('HTTP', `${method} ${url} → ${status} ${statusText || ''}\n${stringify(data)}`);
  } else if (error?.request) {
    addLog('HTTP', `${method} ${url} → sin respuesta (red caída o timeout): ${error.message}`);
  } else {
    addLog('HTTP', `${method} ${url} → error al preparar la petición: ${error?.message}`);
  }
};

export const initLogger = (store, axios) => {
  notificationStore = store;

  if (axios) {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        logAxiosError(error);
        return Promise.reject(error);
      }
    );
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      addLog('WINDOW', `${event.message} @ ${event.filename}:${event.lineno}:${event.colno}`);
    });
    window.addEventListener('unhandledrejection', (event) => {
      addLog('PROMISE', stringify(event.reason));
    });
  }

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    originalError.apply(console, args);
    if (isLogging) return;
    isLogging = true;
    try {
      addLog('ERROR', args.map(stringify).join(' '));
      if (notificationStore) {
        notificationStore.notify('Error detected. Click to copy logs for support.', 'error', 8000, true);
      }
    } catch (e) {
      originalError.apply(console, ['Logger failed:', e]);
    } finally {
      isLogging = false;
    }
  };

  console.warn = (...args) => {
    originalWarn.apply(console, args);
    if (isLogging) return;
    isLogging = true;
    try {
      addLog('WARN', args.map(stringify).join(' '));
    } catch (e) {
      // Ignore
    } finally {
      isLogging = false;
    }
  };
};

// Cabecera de contexto: sin esto, un log pegado desde el móvil no dice ni en qué
// pantalla ni con qué navegador ocurrió.
const buildContext = () => {
  if (typeof window === 'undefined') return '';
  let userId = 'anon';
  try {
    const raw = localStorage.getItem('user');
    if (raw) userId = JSON.parse(raw)?.id || 'anon';
  } catch (e) { /* localStorage puede fallar en modo privado */ }
  return [
    '===== REPPY DEBUG =====',
    `Fecha:    ${new Date().toISOString()}`,
    `URL:      ${window.location.href}`,
    `Usuario:  ${userId}`,
    `Pantalla: ${window.innerWidth}x${window.innerHeight}`,
    `Online:   ${navigator.onLine}`,
    `UA:       ${navigator.userAgent}`,
    '=======================',
    '',
  ].join('\n');
};

export const getLogs = () => {
  const body = logs.length ? logs.join('\n') : '(sin errores registrados en esta sesión)';
  return buildContext() + body;
};

export const clearLogs = () => {
  logs = [];
};

export const copyLogsToClipboard = async () => {
  const text = getLogs();
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Safari/iOS niegan el portapapeles fuera de un gesto directo y en HTTP.
    // Fallback con textarea + execCommand, que sí funciona ahí.
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (fallbackErr) {
      return false;
    }
  }
};

export const sendLogsViaEmail = () => {
  const email = 'romainot99@gmail.com';
  const subject = encodeURIComponent('Reppy Debug Logs - ' + new Date().toLocaleString());

  let fullLogs = getLogs();

  // Límite de seguridad para URLs mailto (algunos clientes fallan > 2000-8000 chars).
  if (fullLogs.length > 4000) {
    fullLogs = fullLogs.substring(fullLogs.length - 4000) + '\n\n[... Logs truncated for email size limits. Please use COPY LOGS for full report ...]';
  }

  const body = encodeURIComponent(
    'Please describe what you were doing when the error occurred:\n\n' +
    '----------------------------------\n' +
    fullLogs +
    '\n----------------------------------'
  );

  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
};
