import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, PiggyBank, Gift, MoreHorizontal } from 'lucide-react'
import Pantalla from '../components/Pantalla'
import CampoDinero from '../components/CampoDinero'
import PanelResumen from '../components/PanelResumen'
import Contador from '../components/Contador'
import { CATEGORIAS_VARIABLES, useStore } from '../lib/store'
import { api } from '../lib/api'

const META = {
  AHORRO: { Icon: PiggyBank, color: 'bg-mint-500', texto: 'text-mint-700', desc: 'Lo que guardas para ti del futuro.' },
  GUSTOS: { Icon: Gift, color: 'bg-gold-500', texto: 'text-gold-700', desc: 'Salidas, antojos, lo que te hace feliz.' },
  OTROS: { Icon: MoreHorizontal, color: 'bg-brand-500', texto: 'text-brand-700', desc: 'Todo lo demás que no es fijo.' },
}

export default function Paso3Distribuir() {
  const { state, dispatch, restante, totalPresupuestado, sinAsignar } = useStore()
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const excedido = totalPresupuestado > restante
  const base = Math.max(restante, 1)

  const continuar = async () => {
    setError(''); setCargando(true)
    try {
      await api.distribuir(restante, state.presupuesto)     // regla: total <= restante
      dispatch({ type: 'IR', paso: 4 })
    } catch (e) { setError(e.message) } finally { setCargando(false) }
  }

  return (
    <Pantalla numero={3} titulo="Distribuye lo que te queda"
      subtitulo={<>Tienes <strong className="text-mint-700">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(restante)}</strong> disponibles. Repártelos; no podrás asignar más de eso.</>}
      aside={<PanelResumen />}>

      {/* Barra apilada */}
      <div className="card p-6">
        <div className="flex items-end justify-between">
          <p className="text-sm font-semibold text-ink-500">Distribución</p>
          <p className={`font-display text-sm font-semibold ${excedido ? 'text-red-600' : 'text-gold-700'}`}>
            {excedido ? 'Excedido en ' : 'Sin asignar: '}<Contador valor={Math.abs(sinAsignar)} />
          </p>
        </div>
        <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-brand-50">
          {CATEGORIAS_VARIABLES.map((cat) => (
            <motion.div key={cat} className={`h-full ${excedido ? 'bg-red-500' : META[cat].color}`}
              animate={{ width: `${Math.min(100, (state.presupuesto[cat] / base) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 90, damping: 20 }} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {CATEGORIAS_VARIABLES.map((cat) => {
          const { Icon, color, texto, desc } = META[cat]
          const v = state.presupuesto[cat]
          return (
            <motion.div key={cat} layout className="card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${color} text-white`}><Icon size={20} /></span>
                <div className="min-w-[140px] flex-1">
                  <p className="font-bold text-brand-900">{cat.charAt(0) + cat.slice(1).toLowerCase()}</p>
                  <p className="text-xs text-ink-500">{desc}</p>
                </div>
                <div className="w-full sm:w-56">
                  <CampoDinero size="sm" valor={v} onChange={(n) => dispatch({ type: 'PRESUPUESTO', cat, valor: n })} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <input type="range" min={0} max={Math.max(restante, 0)} step={10000} value={Math.min(v, Math.max(restante, 0))}
                  onChange={(e) => dispatch({ type: 'PRESUPUESTO', cat, valor: Number(e.target.value) })}
                  className="flex-1" style={{ background: `linear-gradient(to right, var(--color-brand-700) ${(Math.min(v, base) / base) * 100}%, var(--color-brand-100) 0)` }} />
                <span className={`w-12 text-right text-sm font-semibold ${texto}`}>{Math.round((v / base) * 100)}%</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button className="btn-ghost" onClick={() => dispatch({ type: 'IR', paso: 2 })}><ArrowLeft size={18} /> Atrás</button>
        <button className="btn-primary" disabled={excedido || restante < 0 || cargando} onClick={continuar}>
          Siguiente: gastos reales <ArrowRight size={18} />
        </button>
      </div>
    </Pantalla>
  )
}
