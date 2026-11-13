import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import Pantalla from '../components/Pantalla'
import CampoDinero from '../components/CampoDinero'
import PanelResumen from '../components/PanelResumen'
import { useStore } from '../lib/store'
import { api } from '../lib/api'

export default function Paso1Ingreso() {
  const { state, dispatch } = useStore()
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const continuar = async () => {
    setError(''); setCargando(true)
    try {
      const r = await api.ingreso(state.salario)      // validación en el backend
      dispatch({ type: 'SALARIO', valor: r.salario })
      dispatch({ type: 'IR', paso: 2 })
    } catch (e) { setError(e.message) } finally { setCargando(false) }
  }

  return (
    <Pantalla numero={1} titulo="¿Cuánto recibes esta quincena?"
      subtitulo="Escribe tu ingreso neto, lo que realmente llega a tu cuenta. Puedes usar puntos de miles o solo números."
      aside={<PanelResumen />}>
      <div className="card max-w-xl p-8">
        <label htmlFor="salario" className="mb-3 block text-sm font-semibold text-brand-700">Ingreso quincenal</label>
        <CampoDinero id="salario" valor={state.salario} autoFocus placeholder="1.500.000"
          onChange={(v) => dispatch({ type: 'SALARIO', valor: v })} />
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          {[1300000, 1500000, 2000000, 3000000].map((v) => (
            <button key={v} onClick={() => dispatch({ type: 'SALARIO', valor: v })}
              className="chip border border-brand-100 bg-white text-brand-700 hover:bg-brand-50">$ {v.toLocaleString('es-CO')}</button>
          ))}
        </div>
        <button className="btn-primary mt-8 w-full" disabled={!state.salario || cargando} onClick={continuar}>
          {cargando ? 'Validando…' : 'Siguiente: gastos fijos'} <ArrowRight size={18} />
        </button>
      </div>
    </Pantalla>
  )
}
