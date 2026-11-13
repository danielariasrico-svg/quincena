"""
main.py — API HTTP del planificador quincenal (FastAPI).

Arranque:
    uvicorn main:app --reload --port 8000
Documentación interactiva: http://localhost:8000/docs
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import motor

app = FastAPI(
    title="Quincena · Planificador de gastos",
    description=(
        "API que expone, paso a paso, la lógica del programa de consola "
        "original. El archivo original se conserva intacto en "
        "`original/programa_original.py` y puede ejecutarse vía `/consola`."
    ),
    version="1.0.0",
)

# Orígenes permitidos: local + los que se definan en la variable FRONTEND_ORIGINS (separados por coma)
_origenes = ["http://localhost:5173", "http://127.0.0.1:5173"]
_origenes += [o.strip() for o in os.getenv("FRONTEND_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origenes,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

ORIGINAL = Path(__file__).parent / "original" / "programa_original.py"


# ------------------------------------------------------------------
# Modelos de entrada / salida
# ------------------------------------------------------------------
class GastoFijo(BaseModel):
    categoria: str = Field(..., examples=["ARRIENDO"])
    monto: int | str = Field(..., examples=["600.000"])


class IngresoIn(BaseModel):
    salario: int | str = Field(..., examples=["1.500.000"])


class FijosIn(BaseModel):
    salario: int | str
    gastos: list[GastoFijo]


class DistribucionIn(BaseModel):
    dinero_restante: int | str
    presupuesto: dict[str, int | str] = Field(
        ..., examples=[{"AHORRO": 300000, "GUSTOS": 200000, "OTROS": 100000}]
    )


class ReporteIn(BaseModel):
    salario: int | str
    gastos_fijos: list[GastoFijo]
    presupuesto: dict[str, int | str]
    gastos_reales: dict[str, int | str]


class ConsolaIn(BaseModel):
    """Respuestas, en orden, que se escribirían en el teclado al programa original."""
    respuestas: list[str] = Field(
        ...,
        examples=[[
            "1.500.000",
            "ARRIENDO", "600.000", "SI",
            "COMIDA", "300.000", "NO",
            "200.000", "150.000", "100.000",
            "180.000", "170.000", "90.000",
        ]],
    )


def _error(e: Exception) -> HTTPException:
    return HTTPException(status_code=422, detail=str(e))


# ------------------------------------------------------------------
# Endpoints (uno por paso del programa)
# ------------------------------------------------------------------
@app.get("/", tags=["meta"])
def raiz():
    return {"ok": True, "docs": "/docs"}


@app.get("/categorias", tags=["meta"])
def categorias():
    return {"fijas": motor.CATEGORIAS_FIJAS, "variables": motor.CATEGORIAS_VARIABLES}


@app.post("/paso1/ingreso", tags=["pasos"])
def paso1(body: IngresoIn):
    try:
        salario = motor.parsear_monto(body.salario)
    except motor.ErrorValidacion as e:
        raise _error(e)
    return {"salario": salario, "mensaje": "Gracias, por favor siga con la encuesta"}


@app.post("/paso2/fijos", tags=["pasos"])
def paso2(body: FijosIn):
    try:
        return motor.registrar_fijos(body.salario, [g.model_dump() for g in body.gastos])
    except motor.ErrorValidacion as e:
        raise _error(e)


@app.post("/paso3/distribuir", tags=["pasos"])
def paso3(body: DistribucionIn):
    try:
        return motor.distribuir(body.dinero_restante, body.presupuesto)
    except motor.ErrorValidacion as e:
        raise _error(e)


@app.post("/paso5/reporte", tags=["pasos"])
def paso5(body: ReporteIn):
    try:
        return motor.calcular_reporte(
            body.salario,
            [g.model_dump() for g in body.gastos_fijos],
            body.presupuesto,
            body.gastos_reales,
        )
    except motor.ErrorValidacion as e:
        raise _error(e)


@app.post("/consola", tags=["programa original"])
def consola(body: ConsolaIn):
    """
    Ejecuta el programa original SIN MODIFICAR, alimentándole las respuestas
    por entrada estándar, y devuelve exactamente lo que imprime en consola.
    """
    if not ORIGINAL.exists():
        raise HTTPException(500, "No se encontró original/programa_original.py")
    entrada = "\n".join(body.respuestas) + "\n"
    try:
        proc = subprocess.run(
            [sys.executable, "-X", "utf8", str(ORIGINAL)],
            input=entrada,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=10,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(
            422,
            "El programa se quedó esperando más respuestas: revisa la secuencia enviada.",
        )
    return {"codigo_salida": proc.returncode, "salida": proc.stdout, "errores": proc.stderr}
