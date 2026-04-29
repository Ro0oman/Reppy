const MAX_LOGS = 200; // Aumentado para capturar sesiones largas
let logs = [];
let notificationStore = null;

let isLogging = false;

export const initLogger = (store) => {
  notificationStore = store;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    originalError.apply(console, args);
    if (isLogging) return;
    
    isLogging = true;
    try {
      const message = args.map(arg => {
        if (arg instanceof Error) return arg.stack;
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return '[Object non-serializable]';
          }
        }
        return String(arg);
      }).join(' ');
      
      addLog('ERROR', message);
      
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
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      addLog('WARN', message);
    } catch (e) {
      // Ignore
    } finally {
      isLogging = false;
    }
  };
};

const addLog = (level, message) => {
  const timestamp = new Date().toISOString();
  // Si el mensaje es absurdamente largo, lo truncamos para no colapsar la memoria
  const sanitizedMessage = message.length > 10000 ? message.substring(0, 10000) + '... [TRUNCATED]' : message;
  logs.push(`[${timestamp}] [${level}] ${sanitizedMessage}`);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }
};

export const getLogs = () => {
  return logs.join('\n');
};

export const clearLogs = () => {
  logs = [];
};

export const copyLogsToClipboard = async () => {
  const text = getLogs();
  try {
    // El portapapeles aguanta megabytes sin problema
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy logs:', err);
    return false;
  }
};

export const sendLogsViaEmail = () => {
  const email = 'romainot99@gmail.com';
  const subject = encodeURIComponent('Reppy Debug Logs - ' + new Date().toLocaleString());
  
  let fullLogs = getLogs();
  
  // Límite de seguridad para URLs mailto (algunos navegadores/clientes fallan > 2000-8000 chars)
  // Si es muy largo, avisamos al usuario que use el botón de copiar
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
