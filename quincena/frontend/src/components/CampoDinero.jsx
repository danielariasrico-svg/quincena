import { useState } from 'react'
import { fmt, aEntero, soloDigitos } from '../lib/money'

// Campo numérico con separador de miles en vivo. Solo admite dígitos (misma regla del programa).
export default function CampoDinero({ valor, onChange, placeholder = '0', autoFocus = false, size = 'lg', id }) {
  const [tocado, setTocado] = useState(false)
  const texto = valor ? fmt(valor) : ''
  const cls = size === 'lg' ? 'input-money pl-10' : 'input-money !text-lg !py-3 !pr-4 !pl-9'
  return (
    <div className="relative">
      <span className={`pointer-events-none absolute top-1/2 ${size === 'lg' ? 'left-5' : 'left-4'} -translate-y-1/2 font-semibold text-brand-500 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>$</span>
      <input
        id={id}
        inputMode="numeric"
        autoFocus={autoFocus}
        className={cls}
        placeholder={placeholder}
        value={texto}
        onBlur={() => setTocado(true)}
        onChange={(e) => {
          const limpio = soloDigitos(e.target.value)
          onChange(limpio === '' ? 0 : aEntero(limpio))
        }}
      />
      {tocado && valor === 0 && (
        <p className="mt-1.5 text-xs font-medium text-ink-500">Ingresa un valor en números, por ejemplo 1.500.000</p>
      )}
    </div>
  )
}
