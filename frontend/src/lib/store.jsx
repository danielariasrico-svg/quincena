import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const KEY = 'quincena.v1'

export const CATEGORIAS_FIJAS = ['ARRIENDO', 'TRANSPORTE', 'COMIDA', 'SERVICIOS', 'GUSTOS', 'IMPREVISTOS', 'OTROS']
export const CATEGORIAS_VARIABLES = ['AHORRO', 'GUSTOS', 'OTROS']

const inicial = {
  paso: 0,                    // 0 landing, 1..5 pasos
  salario: 0,
  fijos: {},                  // { ARRIENDO: 650000, ... }
  presupuesto: { AHORRO: 0, GUSTOS: 0, OTROS: 0 },
  reales: { AHORRO: 0, GUSTOS: 0, OTROS: 0 },
  reporte: null,
}

function reducer(s, a) {
  switch (a.type) {
    case 'IR': return { ...s, paso: a.paso }
    case 'SALARIO': return { ...s, salario: a.valor }
    case 'FIJO': {
      const fijos = { ...s.fijos }
      if (a.valor === null) delete fijos[a.cat]; else fijos[a.cat] = a.valor
      return { ...s, fijos }
    }
    case 'PRESUPUESTO': return { ...s, presupuesto: { ...s.presupuesto, [a.cat]: a.valor } }
    case 'REAL': return { ...s, reales: { ...s.reales, [a.cat]: a.valor } }
    case 'REPORTE': return { ...s, reporte: a.reporte }
    case 'REINICIAR': return { ...inicial, paso: 1 }
    default: return s
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, inicial, (ini) => {
    try { return { ...ini, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return ini }
  })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* sin almacenamiento */ } }, [state])

  const derivado = useMemo(() => {
    const totalFijos = Object.values(state.fijos).reduce((a, b) => a + b, 0)
    const restante = state.salario - totalFijos
    const totalPresupuestado = Object.values(state.presupuesto).reduce((a, b) => a + b, 0)
    return { totalFijos, restante, totalPresupuestado, sinAsignar: restante - totalPresupuestado }
  }, [state])

  return <Ctx.Provider value={{ state, dispatch, ...derivado }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
