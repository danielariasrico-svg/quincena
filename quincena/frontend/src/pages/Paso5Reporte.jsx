import { useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Printer, TrendingUp, TrendingDown, Terminal, ChevronDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import Contador from '../components/Contador'
import { useStore } from '../lib/store'
import { fmtPesos, fmt } from '../lib/money'
import { api } from '../lib/api'

const COLORES = { fijos: '#0b3c8c', AHORRO: '#1e9e62', GUSTOS: '#c9a227', OTROS: '#1d5fd6', libre: '#d9e6ff' }

export default function Paso5Reporte() {
  const { state, dispatch } = useStore()
  const r = state.reporte
  const [consola, setConsola] = useState(null)
  const [abriendo, setAbriendo] = useState(false)
  if (!r) return null

  const dona = [
    { name: 'Gastos fijos', value: r.total_fijos, color: COLORES.fijos },
    ...r.filas.map((f) => ({ name: f.categoria, value: f.planificado, color: COLORES[f.categoria] })),
    { name: 'Sin asignar', value: Math.max(r.sin_asignar, 0), color: COLORES.libre },
  ].filter((d) => d.value > 0)

  const barras = r.filas.map((f) => ({ name: f.categoria, Planificado: f.planificado, Real: f.real }))
  const positivo = r.balance_final >= 0

  // Reproduce el flujo en el programa original (sin modificar) vía /consola
  const verOriginal = async () => {
    setAbriendo(true)
    try {
      const fijos = Object.entries(state.fijos)
      const resp = [fmt(state.salario)]
      fijos.forEach(([c, m], i) => resp.push(c, fmt(m), i < fijos.length - 1 ? 'SI' : 'NO'))
      if (fijos.length === 0) resp.push('ARRIENDO', '0', 'NO')  // el programa exige al menos un fijo
      ;['AHORRO', 'GUSTOS', 'OTROS'].forEach((c) => resp.push(fmt(state.presupuesto[c])))
      ;['AHORRO', 'GUSTOS', 'OTROS'].forEach((c) => resp.push(fmt(state.reales[c])))
      const out = await api.consola(resp)
      setConsola(out.salida)
    } catch (e) { setConsola(`Error: ${e.message}`) } finally { setAbriendo(false) }
  }

  return (
    <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-6xl px-5 py-10 lg:py-14 print:py-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-700">Paso 5</p>
          <h2 className="text-3xl font-bold text-brand-900 md:text-4xl">Reporte financiero final</h2>
        </div>
        <div className="flex gap-2 print:hidden">
          <button className="btn-ghost" onClick={() => window.print()}><Printer size={18} /> Imprimir / PDF</button>
          <button className="btn-primary" onClick={() => dispatch({ type: 'REINICIAR' })}><RotateCcw size={18} /> Nueva quincena</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi etiqueta="Ingreso total" valor={r.ingreso_total} clase="from-brand-700 to-brand-900 text-white" sub="quincenal" />
        <Kpi etiqueta="Gastos fijos" valor={r.total_fijos} clase="bg-white text-brand-900" sub={`${Math.round((r.total_fijos / r.ingreso_total) * 100) || 0}% del ingreso`} />
        <Kpi etiqueta="Gasto real variable" valor={r.total_real} clase="bg-white text-brand-900" sub={`de ${fmtPesos(r.total_presupuestado)} planeados`} />
        <Kpi etiqueta={positivo ? 'Balance final' : 'Déficit'} valor={Math.abs(r.balance_final)}
          clase={positivo ? 'from-mint-500 to-mint-700 text-white' : 'from-red-500 to-red-700 text-white'}
          sub={positivo ? 'te quedó libre' : 'gastaste de más'} icono={positivo ? TrendingUp : TrendingDown} oro={positivo} />
      </div>

      {/* Tabla */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card mt-8 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-50 text-xs uppercase tracking-wider text-brand-700">
            <tr><th className="px-6 py-4">Categoría</th><th className="px-6 py-4 text-right">Planificado</th><th className="px-6 py-4 text-right">Real</th><th className="px-6 py-4 text-right">Diferencia</th></tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {r.filas.map((f, i) => (
              <motion.tr key={f.categoria} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                <td className="px-6 py-4 font-semibold text-brand-900"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORES[f.categoria] }} />{f.categoria}</td>
                <td className="px-6 py-4 text-right">{fmtPesos(f.planificado)}</td>
                <td className="px-6 py-4 text-right">{fmtPesos(f.real)}</td>
                <td className={`px-6 py-4 text-right font-bold ${f.diferencia >= 0 ? 'text-mint-700' : 'text-red-600'}`}>
                  {f.diferencia >= 0 ? '+' : '−'}{fmtPesos(Math.abs(f.diferencia))}
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot className="bg-brand-50/60 font-semibold text-brand-900">
            <tr><td className="px-6 py-4">Total</td><td className="px-6 py-4 text-right">{fmtPesos(r.total_presupuestado)}</td><td className="px-6 py-4 text-right">{fmtPesos(r.total_real)}</td>
              <td className={`px-6 py-4 text-right ${r.total_presupuestado - r.total_real >= 0 ? 'text-mint-700' : 'text-red-600'}`}>{fmtPesos(r.total_presupuestado - r.total_real)}</td></tr>
          </tfoot>
        </table>
      </motion.div>

      {/* Gráficas */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="card p-6">
          <h3 className="font-bold text-brand-900">¿A dónde fue tu ingreso?</h3>
          <p className="text-xs text-ink-500">Distribución planificada del total quincenal</p>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={dona} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={3} cornerRadius={6} isAnimationActive animationDuration={1200}>
                  {dona.map((d) => <Cell key={d.name} fill={d.color} stroke="#fff" />)}
                </Pie>
                <Tooltip formatter={(v) => fmtPesos(v)} contentStyle={{ borderRadius: 16, border: '1px solid #d9e6ff' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }} className="card p-6">
          <h3 className="font-bold text-brand-900">Planificado vs. real</h3>
          <p className="text-xs text-ink-500">Por categoría variable</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={barras} barGap={6}>
                <CartesianGrid vertical={false} stroke="#eef4ff" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#5b6478' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#5b6478' }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => fmtPesos(v)} cursor={{ fill: '#eef4ff' }} contentStyle={{ borderRadius: 16, border: '1px solid #d9e6ff' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Planificado" fill="#0b3c8c" radius={[8, 8, 0, 0]} animationDuration={1000} />
                <Bar dataKey="Real" fill="#c9a227" radius={[8, 8, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Programa original */}
      <div className="card mt-8 overflow-hidden print:hidden">
        <button onClick={consola === null ? verOriginal : () => setConsola(null)} className="flex w-full items-center justify-between p-5 text-left hover:bg-brand-50/50">
          <span className="flex items-center gap-3 font-semibold text-brand-900"><Terminal size={18} className="text-brand-700" />
            {abriendo ? 'Ejecutando el programa original…' : 'Ver este mismo cálculo en el programa original de consola'}</span>
          <ChevronDown size={18} className={`transition ${consola !== null ? 'rotate-180' : ''}`} />
        </button>
        {consola !== null && (
          <pre className="max-h-96 overflow-auto bg-brand-900 p-5 font-mono text-xs leading-relaxed text-mint-100">{consola}</pre>
        )}
      </div>
    </motion.main>
  )
}

function Kpi({ etiqueta, valor, clase, sub, icono: Icon, oro }) {
  const gradiente = clase.includes('from-') ? `bg-gradient-to-br ${clase}` : clase
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`card relative overflow-hidden p-6 ${gradiente}`}>
      {Icon && <Icon className="absolute right-4 top-4 opacity-30" size={28} />}
      <p className={`text-xs font-semibold uppercase tracking-widest ${clase.includes('text-white') ? 'text-white/70' : 'text-ink-500'}`}>{etiqueta}</p>
      <Contador valor={valor} className={`mt-2 block font-display text-2xl font-bold md:text-3xl ${oro ? 'text-gold-300' : ''}`} />
      <p className={`mt-1 text-xs ${clase.includes('text-white') ? 'text-white/70' : 'text-ink-500'}`}>{sub}</p>
    </motion.div>
  )
}
