/**
 * Normaliza una fecha al formato local YYYY-MM-DD.
 * Esto evita el desfase de zona horaria de .toISOString()
 * @param {Date|string} date 
 * @returns {string} Formato YYYY-MM-DD
 */
export const getLocalDateString = (date = new Date()) => {
  if (!date) date = new Date();
  const d = date instanceof Date ? date : new Date(date);
  
  // Si la fecha no es válida (ej: string vacío), usar hoy
  if (isNaN(d.getTime())) return getLocalDateString(new Date());

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
