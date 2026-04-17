# Filtrar citas por fecha
filtrar_citas = lambda citas, fecha: list(filter(lambda c: c["fecha"] == fecha, citas))

# Ordenar citas por hora
ordenar_citas = lambda citas: sorted(citas, key=lambda c: c["hora"])

# Formatear nombre
formatear_nombre = lambda nombre: nombre.strip().title()