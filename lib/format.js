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

// Zona de referencia Europe/Madrid: el filtro por día se ancla a la misma zona, no a la local (fix DATE01).
const APP_TIME_ZONE = "Europe/Madrid";

// Offset (ms) de la zona en un instante vía formatToParts (sin parsear strings, poco fiable en Hermes).
function tzOffsetMs(instant, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(
    dtf.formatToParts(instant).map((x) => [x.type, x.value]),
  );
  const asWall = Date.UTC(
    +p.year,
    +p.month - 1,
    +p.day,
    +p.hour,
    +p.minute,
    +p.second,
  );
  return asWall - instant.getTime();
}

// Instante UTC de la medianoche del día "ymd" (YYYY-MM-DD) en la zona dada.
function zonedMidnightUTC(ymd, timeZone) {
  const guess = new Date(`${ymd}T00:00:00Z`);
  return new Date(guess.getTime() - tzOffsetMs(guess, timeZone));
}

export function dayRangeISO(day) {
  // Día calendario tal y como se ve en Europe/Madrid → "YYYY-MM-DD"
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(day));

  // Día siguiente vía UTC (robusto en DST: la medianoche nunca cae en el salto en Europe/Madrid).
  const nextUTC = new Date(`${ymd}T00:00:00Z`);
  nextUTC.setUTCDate(nextUTC.getUTCDate() + 1);
  const ymdNext = nextUTC.toISOString().slice(0, 10);

  const start = zonedMidnightUTC(ymd, APP_TIME_ZONE);
  const end = zonedMidnightUTC(ymdNext, APP_TIME_ZONE);

  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export function formatProbability(probability) {
  const prob01 = Math.max(0, Math.min(1, Number(probability) || 0));
  return Math.round(prob01 * 100); // 0..100
}
