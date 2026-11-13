import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useStore } from '../lib/store'

const PASOS = ['Ingreso', 'Gastos fijos', 'Distribución', 'Gastos reales', 'Reporte']

export default function Stepper() {
  const { state, dispatch } = useStore()
  const actual = state.paso
  return (
    <nav className="sticky top-0 z-40 border-b border-brand-100/70 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <button onClick={() => dispatch({ type: 'IR', paso: 0 })} className="flex items-center gap-2 font-display text-lg font-bold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-700 text-gold-300">Q</span>
          Quincena
        </button>
        <ol className="hidden items-center gap-1 md:flex">
          {PASOS.map((nombre, i) => {
            const n = i + 1
            const hecho = n < actual
            const activo = n === actual
            return (
              <li key={nombre} className="flex items-center">
                <button
                  disabled={n > actual}
                  onClick={() => dispatch({ type: 'IR', paso: n })}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition
                    ${activo ? 'bg-brand-700 text-white' : hecho ? 'text-brand-700 hover:bg-brand-50' : 'text-ink-500/60'}`}
                >
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold
                    ${activo ? 'bg-white/20' : hecho ? 'bg-mint-500 text-white' : 'bg-brand-50 text-ink-500'}`}>
                    {hecho ? <Check size={14} strokeWidth={3} /> : n}
                  </span>
                  {nombre}
                </button>
                {i < PASOS.length - 1 && (
                  <span className="mx-1 h-px w-6 bg-brand-100">
                    {hecho && <motion.span layoutId={`l${i}`} className="block h-px w-full bg-mint-500" />}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
        <span className="text-sm font-semibold text-brand-700 md:hidden">Paso {actual} de 5</span>
      </div>
      <motion.div className="h-0.5 bg-gradient-to-r from-brand-500 via-mint-500 to-gold-500"
        initial={false} animate={{ width: `${(actual / 5) * 100}%` }} transition={{ type: 'spring', stiffness: 80, damping: 20 }} />
    </nav>
  )
}
