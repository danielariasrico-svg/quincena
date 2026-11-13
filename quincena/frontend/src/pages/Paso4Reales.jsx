import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Pantalla from '../components/Pantalla'
import CampoDinero from '../components/CampoDinero'
import PanelResumen from '../components/PanelResumen'
import { CATEGORIAS_VARIABLES, useStore } from '../lib/store'
import { api } from '../lib/api'
import { fmtPesos } from '../lib/money'

export default function Paso4Reales() {
  const { state, dispatch } = useStore()
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const generar = async () => {
    setError(''); setCargando(true)
    try {
      const reporte = await api.reporte({
        salario: state.salario,
        gastos_fijos: Object.entries(state.fijos).map(([categoria, monto]) => ({ categoria, monto })),
        presupuesto: state.presupuesto,
        gastos_reales: state.reales,
      })
      dispatch({ type: 'REPORTE', reporte })
      dispatch({ type: 'IR', paso: 5 })
    } catch (e) { setError(e.message) } finally { setCargando(false) }
  }

  return (
    <Pantalla numero={4} titulo="¿Cuánto gastaste realmente?"
      subtitulo="Al cerrar la quincena, registra lo que de verdad salió en cada categoría. Te mostramos lo que habías planeado como referencia."
      aside={<PanelResumen />}>
      <div className="grid gap-4">
        {CATEGORIAS_VARIABLES.map((cat, i) => {
          const plan = state.presupuesto[cat]
          const real = state.reales[cat]
          const dif = plan - real
          return (
            <motion.div key={cat} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[160px] flex-1">
                  <p className="font-bold text-brand-900">{cat.charAt(0) + cat.slice(1).toLowerCase()}</p>
                  <p className="text-xs text-ink-500">Planificado: <span className="font-semibold text-brand-700">{fmtPesos(plan)}</span></p>
                </div>
                <div className="w-full sm:w-60">
                  <CampoDinero size="sm" valor={real} placeholder="Gasto real" onChange={(n) => dispatch({ type: 'REAL', cat, valor: n })} />
                </div>
                <span className={`chip min-w-[120px] justify-center ${real === 0 ? 'bg-brand-50 text-ink-500' : dif >= 0 ? 'bg-mint-100 text-mint-700' : 'bg-red-50 text-red-700'}`}>
                  {real === 0 ? 'Pendiente' : dif >= 0 ? `Sobró ${fmtPesos(dif)}` : `Excedido ${fmtPesos(-dif)}`}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button className="btn-ghost" onClick={() => dispatch({ type: 'IR', paso: 3 })}><ArrowLeft size={18} /> Atrás</button>
        <button className="btn-primary !bg-gold-500 !text-brand-900 hover:!bg-gold-300" disabled={cargando} onClick={generar}>
          <Sparkles size={18} /> {cargando ? 'Calculando…' : 'Generar reporte'}
        </button>
      </div>
    </Pantalla>
  )
}
