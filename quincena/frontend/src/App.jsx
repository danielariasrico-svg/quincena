import { AnimatePresence } from 'framer-motion'
import { StoreProvider, useStore } from './lib/store'
import Stepper from './components/Stepper'
import Landing from './pages/Landing'
import Paso1Ingreso from './pages/Paso1Ingreso'
import Paso2Fijos from './pages/Paso2Fijos'
import Paso3Distribuir from './pages/Paso3Distribuir'
import Paso4Reales from './pages/Paso4Reales'
import Paso5Reporte from './pages/Paso5Reporte'

const PASOS = { 1: Paso1Ingreso, 2: Paso2Fijos, 3: Paso3Distribuir, 4: Paso4Reales, 5: Paso5Reporte }

function Flujo() {
  const { state } = useStore()
  const Paso = PASOS[state.paso]
  return (
    <>
      {state.paso > 0 && <Stepper />}
      <AnimatePresence mode="wait">
        {state.paso === 0 ? <Landing key="landing" /> : <Paso key={state.paso} />}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Flujo />
    </StoreProvider>
  )
}
