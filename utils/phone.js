export function normalizePhone(input) {
  // quita espacios/guiones/paréntesis y deja solo + y dígitos
  const s = (input ?? "").trim().replace(/[^\d+]/g, "");

  // si hay '+', que solo sea uno y al inicio
  if (s.startsWith("+")) return "+" + s.slice(1).replace(/\+/g, "");
  return s.replace(/\+/g, "");
}

export function isValidPhoneSimple(input) {
  const p = normalizePhone(input);
  // + opcional y 9..15 dígitos (rango típico internacional)
  return /^\+?\d{9,15}$/.test(p);
}
