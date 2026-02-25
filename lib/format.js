// utils/format.js
export function formatDateTimeWithWeekday(
  iso,
  locale = "es-ES",
  timeZone = "Europe/Madrid",
) {
  if (!iso) return { fecha: "-", hora: "-", dia: "-", texto: "-" };

  const d = new Date(iso);

  const dia = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone,
  }).format(d); // "sábado"

  const fecha = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(d); // "21/02/2026"

  const hora = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    hour12: false,
  }).format(d); // "03:00"

  const capitalizedDay = dia.charAt(0).toUpperCase() + dia.slice(1);

  const texto = `${capitalizedDay}, ${fecha} · ${hora}`; // "sábado, 21/02/2026 · 03:00"

  return { dia, fecha, hora, capitalizedDay, texto };
}

export function dayRangeISO(day) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { startISO: start.toISOString(), endISO: end.toISOString() };
}
