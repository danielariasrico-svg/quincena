import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import Contador from './Contador'

// Panel lateral "en vivo": ingreso, fijos, restante y asignado.
export default function PanelResumen() {
  const { state, totalFijos, restante, totalPresupuestado, sinAsignar } = useStore()
  const pct = state.salario ? Math.min(100, (totalFijos / state.salario) * 100) : 0
  const pctVar = restante > 0 ? Math.min(100, (totalPresupuestado / restante) * 100) : 0
  const excedido = totalPresupuestado > restante
  return (
    <motion.aside layout className="card overflow-hidden">
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-300">Tu quincena</p>
        <Contador valor={state.salario} className="mt-1 block font-display text-3xl font-bold" />
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <motion.div className="h-full rounded-full bg-gold-500" animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 60, damping: 18 }} />
        </div>
        <p className="mt-2 text-xs text-white/70">{Math.round(pct)}% comprometido en gastos fijos</p>
      </div>
      <dl className="divide-y divide-brand-100 p-6 text-sm">
        <Fila label="Gastos fijos" valor={totalFijos} color="text-brand-700" />
        <Fila label="Dinero restante" valor={restante} color={restante < 0 ? 'text-red-600' : 'text-mint-700'} fuerte />
        {state.paso >= 3 && (
          <>
            <Fila label="Asignado" valor={totalPresupuestado} color={excedido ? 'text-red-600' : 'text-brand-700'} />
            <Fila label="Sin asignar" valor={sinAsignar} color={excedido ? 'text-red-600' : 'text-gold-700'} />
            <div className="pt-3">
              <div className="h-2 overflow-hidden rounded-full bg-brand-50">
                <motion.div className={`h-full rounded-full ${excedido ? 'bg-red-500' : 'bg-mint-500'}`} animate={{ width: `${pctVar}%` }} />
              </div>
            </div>
          </>
        )}
      </dl>
    </motion.aside>
  )
}

function Fila({ label, valor, color, fuerte }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-ink-500">{label}</dt>
      <dd><Contador valor={valor} className={`font-display font-semibold ${fuerte ? 'text-lg' : ''} ${color}`} /></dd>
    </div>
  )
}
