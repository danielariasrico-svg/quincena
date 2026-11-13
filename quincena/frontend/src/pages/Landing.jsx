import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Wallet, PieChart, LineChart, ShieldCheck, Sparkles } from 'lucide-react'
import { useStore } from '../lib/store'

const Monedas = lazy(() => import('../three/Monedas'))

const aparece = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, delay: d, ease: [0.16, 1, 0.3, 1] },
})

export default function Landing() {
  const { dispatch, state } = useStore()
  const continuar = state.salario > 0
  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      {/* HERO */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-2 lg:pt-20">
        <div className="relative z-10">
          <motion.span {...aparece(0)} className="chip bg-gold-500/15 text-gold-700">
            <Sparkles size={14} /> Planificación quincenal inteligente
          </motion.span>
          <motion.h1 {...aparece(0.08)} className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-tight text-brand-900 md:text-6xl">
            Tu quincena,
            <span className="block bg-gradient-to-r from-brand-700 via-brand-500 to-mint-500 bg-clip-text text-transparent">bajo control.</span>
          </motion.h1>
          <motion.p {...aparece(0.16)} className="mt-6 max-w-lg text-lg text-ink-500">
            Registra tu ingreso, separa los gastos fijos, distribuye lo que queda y compara al final
            lo planeado con lo real. Cinco pasos, cero hojas de cálculo.
          </motion.p>
          <motion.div {...aparece(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
            <button className="btn-primary shadow-soft" onClick={() => dispatch({ type: continuar ? 'IR' : 'REINICIAR', paso: 1 })}>
              {continuar ? 'Continuar mi quincena' : 'Planear mi quincena'} <ArrowRight size={18} />
            </button>
            <a href="#como-funciona" className="btn-ghost">Ver cómo funciona</a>
          </motion.div>
          <motion.dl {...aparece(0.34)} className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-brand-100 pt-6">
            {[['5', 'pasos guiados'], ['7', 'categorías de gasto'], ['100%', 'en tu navegador']].map(([n, l]) => (
              <div key={l}><dt className="font-display text-2xl font-bold text-brand-700">{n}</dt><dd className="text-xs text-ink-500">{l}</dd></div>
            ))}
          </motion.dl>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[380px] md:h-[460px] lg:h-[520px]">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-50 via-white to-mint-100/60" />
          <Suspense fallback={<div className="absolute inset-0 animate-pulse rounded-[2.5rem] bg-brand-50" />}>
            <Monedas className="absolute inset-0 cursor-grab" />
          </Suspense>
        </motion.div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-16">
        <motion.h2 {...aparece()} className="text-center text-3xl font-bold text-brand-900 md:text-4xl">Un método, tres momentos</motion.h2>
        <motion.p {...aparece(0.08)} className="mx-auto mt-3 max-w-xl text-center text-ink-500">
          Primero lo que no se puede mover, después lo que decides, y al final la verdad de los números.
        </motion.p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { Icon: Wallet, c: 'text-brand-700 bg-brand-50', t: 'Fijos', d: 'Arriendo, transporte, servicios… lo que sí o sí se paga. Lo restas del ingreso y sabes con cuánto cuentas de verdad.' },
            { Icon: PieChart, c: 'text-mint-700 bg-mint-100', t: 'Distribución', d: 'Reparte el restante entre ahorro, gustos y otros. La app no te deja asignar más de lo que tienes.' },
            { Icon: LineChart, c: 'text-gold-700 bg-gold-500/15', t: 'Reporte', d: 'Al cerrar la quincena registras lo real y ves, categoría por categoría, dónde sobró y dónde te excediste.' },
          ].map(({ Icon, c, t, d }, i) => (
            <motion.article key={t} {...aparece(0.1 * i)} whileHover={{ y: -6 }} className="card p-7">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c}`}><Icon size={22} /></span>
              <h3 className="mt-5 text-xl font-bold text-brand-900">{t}</h3>
              <p className="mt-2 text-ink-500">{d}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CONFIANZA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <motion.div {...aparece()} className="card flex flex-col items-center gap-6 overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-center text-white md:flex-row md:text-left">
          <ShieldCheck size={48} className="shrink-0 text-gold-300" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold">Tus datos no salen de tu equipo</h3>
            <p className="mt-1 text-white/75">Los cálculos los hace un motor en Python que corre localmente. Nada se envía a terceros ni se guarda en la nube.</p>
          </div>
          <button className="btn-primary !bg-gold-500 !text-brand-900 hover:!bg-gold-300" onClick={() => dispatch({ type: continuar ? 'IR' : 'REINICIAR', paso: 1 })}>
            Empezar ahora <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>
      <footer className="border-t border-brand-100 py-8 text-center text-sm text-ink-500">
        Quincena · Proyecto de programación · Universidad EAN · {new Date().getFullYear()}
      </footer>
    </motion.main>
  )
}
