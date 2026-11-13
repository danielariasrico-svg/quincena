# Quincena · Planificador de gastos

Aplicación web construida alrededor del programa de consola `backend/original/programa_original.py`,
que se conserva **sin ninguna modificación**. La web reproduce sus cinco pasos con una interfaz
moderna (React + Three.js + animaciones) y un backend en Python (FastAPI).

```
gastos-web/
├── backend/
│   ├── original/programa_original.py   ← tu código, intacto (se ejecuta vía /consola)
│   ├── motor.py                        ← la misma lógica expresada como funciones
│   ├── main.py                         ← API HTTP (FastAPI), un endpoint por paso
│   └── requirements.txt
└── frontend/                           ← React + Vite + Tailwind + Framer Motion + R3F + Recharts
    └── src/
        ├── pages/        Landing y Paso1..Paso5
        ├── components/   Stepper, CampoDinero, Contador, PanelResumen
        ├── three/        Monedas.jsx (escena 3D del hero)
        └── lib/          api.js, store.jsx, money.js
```

## Requisitos

- Python 3.10 o superior
- Node.js 18 o superior (incluye npm)

## Ejecutar en local

Se necesitan **dos terminales** abiertas al mismo tiempo.

### Terminal 1 — Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate          # en Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Documentación interactiva de la API: <http://localhost:8000/docs>

### Terminal 2 — Frontend

```powershell
cd frontend
npm install                      # solo la primera vez
npm run dev
```

Abre <http://localhost:5173>. Vite reenvía automáticamente las llamadas `/api/*` al backend.

## Correspondencia con el programa original

| Paso del programa                 | Función en `motor.py`  | Endpoint              | Pantalla web        |
|-----------------------------------|------------------------|-----------------------|---------------------|
| 1. Registrar ingreso              | `parsear_monto`        | `POST /paso1/ingreso` | Paso 1 · Ingreso    |
| 2. Registrar gastos fijos         | `registrar_fijos`      | `POST /paso2/fijos`   | Paso 2 · Fijos      |
| 3. Distribuir dinero restante     | `distribuir`           | `POST /paso3/distribuir` | Paso 3 · Distribución |
| 4. Registrar gastos reales        | (en `calcular_reporte`)| —                     | Paso 4 · Reales     |
| 5. Generar reporte                | `calcular_reporte`     | `POST /paso5/reporte` | Paso 5 · Reporte    |
| Programa completo, sin modificar  | —                      | `POST /consola`       | Botón "Ver en el programa original" del reporte |

Las reglas se conservan exactamente: montos enteros con o sin puntos de miles
(`valor.replace(".", "").isdigit()`), categorías normalizadas con `strip().upper()`,
acumulación de montos si una categoría fija se repite, validación
`total_presupuestado <= dinero_restante` en el paso 3 y diferencia = planificado − real
en el reporte.

## Paleta

Blanco de base, azul `#0B3C8C` para estructura, verde `#1E9E62` para ingreso y saldo positivo,
dorado `#C9A227` reservado para acentos de valor.

## Compilar para producción

```powershell
cd frontend
npm run build        # genera frontend/dist
```

Para desplegarlo en línea: el frontend en Vercel o Netlify (definir `VITE_API_URL` con la URL
del backend) y el backend en Render o Railway (`uvicorn main:app --host 0.0.0.0 --port $PORT`),
agregando el dominio del frontend a `allow_origins` en `main.py`.
