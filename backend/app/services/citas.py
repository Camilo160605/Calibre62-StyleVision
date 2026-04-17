def crear_cita(citas, nueva_cita):
    citas.append(nueva_cita)
    return citas

def eliminar_cita(citas, id_cita):
    return [c for c in citas if c["id"] != id_cita]

def obtener_citas(citas):
    return citas