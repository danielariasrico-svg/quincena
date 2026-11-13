import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { fmt } from '../lib/money'

// Cifra que "cuenta" hasta su valor cada vez que cambia.
export default function Contador({ valor, prefijo = '$ ', className = '' }) {
  const mv = useMotionValue(0)
  const texto = useTransform(mv, (v) => prefijo + fmt(Math.round(v)))
  const primera = useRef(true)
  useEffect(() => {
    const ctrl = animate(mv, valor, { duration: primera.current ? 1.1 : 0.6, ease: [0.16, 1, 0.3, 1] })
    primera.current = false
    return ctrl.stop
  }, [valor, mv])
  return <motion.span className={className}>{texto}</motion.span>
}
