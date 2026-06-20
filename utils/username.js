export function normalizeUsername(input) {
  return (input ?? "").trim();
}

export function isValidUsername(input) {
  // letras, dígitos y guion bajo; longitud 3..30
  return /^[a-zA-Z0-9_]{3,30}$/.test(normalizeUsername(input));
}
