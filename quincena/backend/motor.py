"""
motor.py — Lógica del planificador quincenal expresada como funciones puras.

Este módulo reproduce, regla por regla, el comportamiento del programa de
consola original (ver original/programa_original.py), que NO se modifica.
La correspondencia con los pasos del programa es:

    PASO 1  registrar ingreso            -> parsear_monto
    PASO 2  registrar gastos fijos       -> registrar_fijos
    PASO 3  distribuir dinero restante   -> distribuir
    PASO 4  registrar gastos reales      -> (validación en calcular_reporte)
    PASO 5  generar el reporte           -> calcular_reporte
"""

from __future__ import annotations

# Mismas categorías y en el mismo orden que el programa original.
CATEGORIAS_FIJAS: list[str] = [
    "ARRIENDO",
    "TRANSPORTE",
    "COMIDA",
    "SERVICIOS",
    "GUSTOS",
    "IMPREVISTOS",
    "OTROS",
]

CATEGORIAS_VARIABLES: list[str] = ["AHORRO", "GUSTOS", "OTROS"]


class ErrorValidacion(ValueError):
    """Entrada inválida, equivalente a los mensajes de ERROR del programa."""


# ------------------------------------------------------------------
# PASO 1 — Ingreso
# ------------------------------------------------------------------
def parsear_monto(valor) -> int:
    """
    Replica la validación `valor.replace(".", "").isdigit()` del original:
    acepta enteros no negativos escritos con o sin puntos de miles
    ("1.500.000" o "1500000"). Rechaza decimales, negativos y texto.
    """
    if isinstance(valor, bool):
        raise ErrorValidacion("Valor no válido, ingrese un número")
    if isinstance(valor, int):
        if valor < 0:
            raise ErrorValidacion("Valor no válido, ingrese un número")
        return valor
    texto = str(valor).strip().replace(".", "")
    if not texto.isdigit():
        raise ErrorValidacion("Valor no válido, ingrese un número")
    return int(texto)


# ------------------------------------------------------------------
# PASO 2 — Gastos fijos
# ------------------------------------------------------------------
def normalizar_categoria(nombre: str) -> str:
    """Equivale a `categoria.strip().upper()` del original."""
    return str(nombre).strip().upper()


def registrar_fijos(salario, gastos: list[dict]) -> dict:
    """
    Recibe una lista de {categoria, monto}. Igual que el programa, si una
    categoría se repite los montos se acumulan (gastos_fijos.get(cat, 0) + monto).
    Devuelve los gastos consolidados, el total y el dinero restante.
    """
    salario_int = parsear_monto(salario)
    gastos_fijos: dict[str, int] = {}

    for item in gastos:
        categoria = normalizar_categoria(item.get("categoria", ""))
        if categoria not in CATEGORIAS_FIJAS:
            raise ErrorValidacion(
                f"Valor no válido, ingrese una categoría válida: {categoria or '(vacía)'}"
            )
        monto = parsear_monto(item.get("monto"))
        gastos_fijos[categoria] = gastos_fijos.get(categoria, 0) + monto

    total_fijos = sum(gastos_fijos.values())
    dinero_restante = salario_int - total_fijos

    return {
        "salario": salario_int,
        "gastos_fijos": gastos_fijos,
        "total_fijos": total_fijos,
        "dinero_restante": dinero_restante,
    }


# ------------------------------------------------------------------
# PASO 3 — Distribución
# ------------------------------------------------------------------
def distribuir(dinero_restante, presupuesto: dict) -> dict:
    """
    Valida la regla central del PASO 3:
        total_presupuestado <= dinero_restante
    Si se cumple, devuelve lo asignado y el sobrante sin asignar.
    Si no, lanza ErrorValidacion con el mismo mensaje de "¡Cuidado!".
    """
    restante = parsear_monto(dinero_restante)
    presupuesto_variable: dict[str, int] = {}

    for cat in CATEGORIAS_VARIABLES:
        if cat not in presupuesto:
            raise ErrorValidacion(f"Falta el monto para {cat}")
        presupuesto_variable[cat] = parsear_monto(presupuesto[cat])

    total_presupuestado = sum(presupuesto_variable.values())

    if total_presupuestado > restante:
        raise ErrorValidacion(
            f"¡Cuidado! Estás intentando distribuir ${total_presupuestado:,.0f}, "
            f"pero solo te quedan ${restante:,.0f}. Vuelve a intentarlo."
        )

    return {
        "presupuesto_variable": presupuesto_variable,
        "total_presupuestado": total_presupuestado,
        "sin_asignar": restante - total_presupuestado,
    }


# ------------------------------------------------------------------
# PASOS 4 y 5 — Gastos reales y reporte
# ------------------------------------------------------------------
def calcular_reporte(salario, gastos_fijos_lista: list[dict],
                     presupuesto: dict, gastos_reales: dict) -> dict:
    """
    Reconstruye el flujo completo y produce los datos del REPORTE FINANCIERO
    FINAL: ingreso, total fijos, y por categoría planificado / real / diferencia,
    donde diferencia = plan - real (positivo = sobró, negativo = se excedió).
    """
    paso2 = registrar_fijos(salario, gastos_fijos_lista)
    paso3 = distribuir(paso2["dinero_restante"], presupuesto)

    filas = []
    total_real = 0
    for cat in CATEGORIAS_VARIABLES:
        if cat not in gastos_reales:
            raise ErrorValidacion(f"Falta el gasto real para {cat}")
        plan = paso3["presupuesto_variable"][cat]
        real = parsear_monto(gastos_reales[cat])
        total_real += real
        filas.append({
            "categoria": cat,
            "planificado": plan,
            "real": real,
            "diferencia": plan - real,
        })

    return {
        "ingreso_total": paso2["salario"],
        "total_fijos": paso2["total_fijos"],
        "dinero_restante": paso2["dinero_restante"],
        "gastos_fijos": paso2["gastos_fijos"],
        "total_presupuestado": paso3["total_presupuestado"],
        "sin_asignar": paso3["sin_asignar"],
        "total_real": total_real,
        "filas": filas,
        "balance_final": paso2["dinero_restante"] - total_real,
    }


def formato_pesos(valor: int) -> str:
    """Mismo formato que los prints del original: $1,500,000."""
    return f"${valor:,.0f}"
