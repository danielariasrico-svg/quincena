# ==========================================
# PASO 1: Registrar ingresos
# ==========================================
while True:
    salario_u = input("Coloque su ingreso de esta quincena (ejemplo: 1.500.000): ")
    if salario_u.replace(".", "").isdigit():
        salario = int(salario_u.replace(".", ""))
        print("Gracias, por favor siga con la encuesta\n")
        break
    else:
        print("Valor no válido, ingrese su salario en números")

# ==========================================
# PASO 2: Registrar sus gastos fijos
# ==========================================
categorias = [
    "ARRIENDO",
    "TRANSPORTE",
    "COMIDA",
    "SERVICIOS",
    "GUSTOS",
    "IMPREVISTOS",
    "OTROS"
]

gastos_fijos = {}
dos_opciones = ("SI", "NO")

print("--- REGISTRO DE GASTOS FIJOS ---")
while True:
    print("\nLas categorías de gastos son las siguientes:")
    for cat in categorias:
        print(f"- {cat}")
        
    categoria = input("Por favor ingrese las categorías que considera gastos fijos (ejemplo: ARRIENDO): ")
    categoria = categoria.strip().upper()
    
    if categoria in categorias:
        while True:
            monto = input(f"¿Cuánto es el monto para {categoria}? (aproximadamente): ")
            if monto.replace(".", "").isdigit():
                monto = int(monto.replace(".", ""))
                print("Gracias, siga con la encuesta")
                break
            else:
                print("ERROR, valor inválido, meta un valor válido")
                
        gastos_fijos[categoria] = gastos_fijos.get(categoria, 0) + monto
        
        while True:
            mas_respuestas = input("¿Tiene algún otro gasto fijo? (SI/NO): ")
            mas_respuestas = mas_respuestas.strip().upper()
            if mas_respuestas in dos_opciones:  
               break
            else:
               print("ERROR, ingresa si o no")
               
        if mas_respuestas == "SI":
            continue
        else:
            break
    else:
        print("Valor no válido, ingrese una categoría válida")

total_fijos = sum(gastos_fijos.values())
dinero_restante = salario - total_fijos

print(f"\nResumen Paso 2 -> Total gastos fijos: ${total_fijos:,.0f}")
print(f"Dinero restante tras pagar gastos fijos: ${dinero_restante:,.0f}\n")


# ==========================================
# PASO 3: Distribuir el dinero restante
# ==========================================
print("--- PASO 3: DISTRIBUCIÓN DEL DINERO RESTANTE ---")
print(f"Tienes ${dinero_restante:,.0f} disponibles para distribuir.")

presupuesto_variable = {}
# Usamos categorías variables que no choquen directamente con las fijas que ya pagó, 
# o permitimos elegir entre las restantes (ej. AHORRO, GUSTOS, OTROS)
categorias_variables = ["AHORRO", "GUSTOS", "OTROS"]

while True:
    presupuesto_variable.clear()
    
    for cat in categorias_variables:
        while True:
            monto_v = input(f"¿Cuánto planeas destinar a {cat}?: ")
            if monto_v.replace(".", "").isdigit():
                monto_v = int(monto_v.replace(".", ""))
                presupuesto_variable[cat] = monto_v
                break
            else:
                print("ERROR, ingresa un número válido.")
                
    total_presupuestado = sum(presupuesto_variable.values())
    
    if total_presupuestado <= dinero_restante:
        print(f"✅ Distribución exitosa. Te quedan ${dinero_restante - total_presupuestado:,.0f} sin asignar.")
        break
    else:
        print(f"❌ ¡Cuidado! Estás intentando distribuir ${total_presupuestado:,.0f}, pero solo te quedan ${dinero_restante:,.0f}. Vuelve a intentarlo.\n")


# ==========================================
# PASO 4: Registrar los gastos reales
# ==========================================
print("\n--- PASO 4: REGISTRO DE GASTOS REALES ---")
print("Durante la quincena, irás registrando lo que realmente gastas en cada categoría.")

gastos_reales = {}
for cat in presupuesto_variable.keys():
    while True:
        gasto_r = input(f"¿Cuánto gastaste REALMENTE en {cat} al finalizar la quincena?: ")
        if gasto_r.replace(".", "").isdigit():
            gastos_reales[cat] = int(gasto_r.replace(".", ""))
            break
        else:
            print("ERROR, ingresa un número válido.")


# ==========================================
# PASO 5: Generar el reporte
# ==========================================
print("\n" + "="*50)
print("               REPORTE FINANCIERO FINAL               ")
print("="*50)
print(f"Ingreso Total Quincenal : ${salario:,.0f}")
print(f"Total Gastos Fijos      : ${total_fijos:,.0f}")
print("-" * 50)
print(f"{'CATEGORÍA':<15} | {'PLANIFICADO':<12} | {'REAL':<12} | {'DIFERENCIA':<12}")
print("-" * 50)

for cat in presupuesto_variable:
    plan = presupuesto_variable[cat]
    real = gastos_reales[cat]
    diferencia = plan - real  
    
    estado = f"${diferencia:,.0f}"
    print(f"{cat:<15} | ${plan:<11,.0f} | ${real:<11,.0f} | {estado:<12}")

print("="*50)