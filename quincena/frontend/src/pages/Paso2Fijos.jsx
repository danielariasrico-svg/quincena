import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Home, Bus, Utensils, Lightbulb, Gift, AlertTriangle, MoreHorizontal, X } from 'lucide-react'
import Pantalla from '../components/Pantalla'
import CampoDinero from '../components/CampoDinero'
import PanelResumen from '../components/PanelResumen'
import { CATEGORIAS_FIJAS, useStore } from '../lib/store'
import { api } from '../lib/api'
import { fmtPesos } from '../lib/money'

const ICONOS = { ARRIENDO: Home, TRANSPORTE: Bus, COMIDA: Utensils, SERVICIOS: Lightbulb, GUSTOS: Gift, IMPREVISTOS: AlertTriangle, OTROS: MoreHorizontal }

export default function Paso2Fijos() {
  const { state, dispatch, restante } = useStore()
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const seleccionadas = Object.keys(state.fijos)

  const toggle = (cat) => {
    if (cat in state.fijos) dispatch({ type: 'FIJO', cat, valor: null })
    else dispatch({ type: 'FIJO', cat, valor: 0 })
  }

  const continuar = async () => {
    setError(''); setCargando(true)
    try {
      const gastos = Object.entries(state.fijos).map(([categoria, monto]) => ({ categoria, monto }))
      await api.fijos(state.salario, gastos)
      dispatch({ type: 'IR', paso: 3 })
    } catch (e) { setError(e.message) } finally { setCargando(false) }
  }

  const incompleto = seleccionadas.some((c) => !state.fijos[c])

  return (
    <Pantalla numero={2} titulo="Tus gastos fijos"
      subtitulo="Selecciona las categorías que pagas sí o sí cada quincena e indica un monto aproximado."
      aside={<PanelResumen />}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIAS_FIJAS.map((cat) => {
          const Icon = ICONOS[cat]
          const activa = cat in state.fijos
          return (
            <motion.button layout key={cat} onClick={() => toggle(cat)} whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition
                ${activa ? 'border-brand-700 bg-brand-700 text-white shadow-soft' : 'border-brand-100 bg-white text-brand-900 hover:border-brand-500/50'}`}>
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${activa ? 'bg-white/15 text-gold-300' : 'bg-brand-50 text-brand-700'}`}><Icon size={20} /></span>
              <span className="font-semibold">{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {seleccionadas.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-8 overflow-hidden">
            <div className="card divide-y divide-brand-100 p-2">
              {seleccionadas.map((cat) => (
                <motion.div key={cat} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center gap-4 p-4">
                  <span className="w-32 font-semibold text-brand-900">{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                  <div className="min-w-[220px] flex-1">
                    <CampoDinero size="sm" valor={state.fijos[cat]} placeholder="Monto aproximado" autoFocus={!state.fijos[cat]}
                      onChange={(v) => dispatch({ type: 'FIJO', cat, valor: v })} />
                  </div>
                  <button onClick={() => toggle(cat)} className="rounded-full p-2 text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label="Quitar"><X size={18} /></button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {restante < 0 && (
        <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
          Tus gastos fijos superan el ingreso en {fmtPesos(-restante)}. Puedes continuar, pero no quedará dinero para distribuir.
        </p>
      )}
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button className="btn-ghost" onClick={() => dispatch({ type: 'IR', paso: 1 })}><ArrowLeft size={18} /> Atrás</button>
        <button className="btn-primary" disabled={incompleto || cargando} onClick={continuar}>
          {seleccionadas.length === 0 ? 'No tengo gastos fijos' : 'Siguiente: distribuir'} <ArrowRight size={18} />
        </button>
      </div>
    </Pantalla>
  )
}
