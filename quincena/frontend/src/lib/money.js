// Formato colombiano: 1.500.000  (mismo criterio que el programa: enteros, puntos de miles)
export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(n) || 0)

export const fmtPesos = (n) => `$ ${fmt(n)}`

// Deja solo dígitos, igual que value.replace(".", "").isdigit()
export const soloDigitos = (s) => String(s ?? '').replace(/\D/g, '')

export const aEntero = (s) => {
  const d = soloDigitos(s)
  return d === '' ? 0 : parseInt(d, 10)
}
