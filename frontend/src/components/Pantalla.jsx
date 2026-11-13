import { motion } from 'framer-motion'

// Envoltorio de cada paso: título, subtítulo y transición de entrada/salida lateral.
export default function Pantalla({ numero, titulo, subtitulo, children, aside }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_360px] lg:py-14"
    >
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-700">Paso {numero}</p>
        <h2 className="text-3xl font-bold text-brand-900 md:text-4xl">{titulo}</h2>
        {subtitulo && <p className="mt-3 max-w-xl text-ink-500">{subtitulo}</p>}
        <div className="mt-8">{children}</div>
      </div>
      {aside && <div className="lg:sticky lg:top-24 lg:self-start">{aside}</div>}
    </motion.section>
  )
}
