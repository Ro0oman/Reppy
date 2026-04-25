const MAX_LOGS = 50;
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
      const message = args.map(arg => 
        typeof arg === 'object' ? (arg instanceof Error ? arg.stack : JSON.stringify(arg, null, 2)) : String(arg)
      ).join(' ');
      
      addLog('ERROR', message);
      
      // Auto-notify on error if store is available
      if (notificationStore) {
        notificationStore.notify('Error detected. Click to copy logs for support.', 'error', 8000, true);
      }
    } catch (e) {
      originalError.apply(console, ['Logger failed:', e]);
    } finally {
      isLogging = false;
    }
  };

  // Optional: capture warnings too but don't trigger toast
  console.warn = (...args) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    addLog('WARN', message);
    originalWarn.apply(console, args);
  };
};

const addLog = (level, message) => {
  const timestamp = new Date().toISOString();
  logs.push(`[${timestamp}] [${level}] ${message}`);
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
  const body = encodeURIComponent(
    'Please describe what you were doing when the error occurred:\n\n' +
    '----------------------------------\n' +
    getLogs() +
    '\n----------------------------------'
  );
  
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
};
