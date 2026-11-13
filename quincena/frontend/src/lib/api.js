// Cliente mínimo hacia el backend FastAPI. En desarrollo Vite reenvía /api -> :8000.
const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = typeof data.detail === 'string' ? data.detail : 'Solicitud inválida'
    throw new Error(detail)
  }
  return data
}

export const api = {
  categorias: () => fetch(`${BASE}/categorias`).then((r) => r.json()),
  ingreso: (salario) => post('/paso1/ingreso', { salario }),
  fijos: (salario, gastos) => post('/paso2/fijos', { salario, gastos }),
  distribuir: (dinero_restante, presupuesto) => post('/paso3/distribuir', { dinero_restante, presupuesto }),
  reporte: (payload) => post('/paso5/reporte', payload),
  consola: (respuestas) => post('/consola', { respuestas }),
}
