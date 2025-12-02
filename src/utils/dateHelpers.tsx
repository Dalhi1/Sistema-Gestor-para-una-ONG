// Helper to convert string dates to Date objects
export const parseDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

// Format date to Spanish locale
export const formatDate = (date: Date | string): string => {
  return parseDate(date).toLocaleDateString('es-ES');
};

//Este es un helper o utilidad para manejar fechas de forma consistente en la aplicación.