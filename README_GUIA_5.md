# Guia Semana 5 - Evidencia de Estructuras Iterativas y Diccionarios

## 1. Resumen general del proyecto

Este proyecto corresponde a la plataforma administrativa de **Calibre 62**, una aplicacion con frontend en React y backend en FastAPI. El sistema permite consultar un dashboard, gestionar citas, administrar servicios y controlar el equipo de trabajo. Adicionalmente incluye un modulo visual de espejo virtual AR.

Para fines academicos, el proyecto fue reorganizado y documentado para que quede claro:

- donde se usan listas y diccionarios
- como se recorren colecciones con estructuras iterativas
- donde se aplican validaciones y manejo de errores
- como se generan reportes a partir de colecciones de datos
- por que se eligio una estructura tipo diccionario en lugar de una lista simple

## 2. Que hace el sistema

El sistema administra informacion de una barberia o centro de servicios personales:

- muestra indicadores generales en el dashboard
- lista y actualiza el estado de las citas
- permite crear y eliminar servicios
- permite registrar profesionales y cambiar su disponibilidad
- mantiene un modo fallback con datos locales cuando la API no esta disponible

## 3. Archivos importantes del proyecto

### Backend

- `backend/app/main.py`: configuracion principal de FastAPI y procesamiento de origenes permitidos
- `backend/app/schemas.py`: modelos y validaciones de entrada con Pydantic
- `backend/app/seed.py`: datos semilla en listas de diccionarios
- `backend/app/store.py`: nucleo logico del almacenamiento en memoria y generacion de reportes
- `backend/app/routers/*.py`: endpoints del sistema

### Frontend

- `src/data/mock.js`: datos locales de apoyo cuando el backend no responde
- `src/lib/api.js`: capa de acceso a datos y modo fallback
- `src/components/Sidebar.jsx`: menu generado de forma iterativa
- `src/views/Dashboard.jsx`: reporte general del sistema
- `src/views/Appointments.jsx`: filtrado, check-in y recorrido de citas
- `src/views/Services.jsx`: gestion de servicios y validacion de formulario
- `src/views/Staff.jsx`: gestion del equipo y cambio de estado
- `src/views/MirrorAR.jsx`: evidencia adicional de ciclos `for`, condicionales y `try/catch`

## 4. Estructuras de datos usadas

### Listas

Las listas se usan para almacenar colecciones de registros:

- citas
- servicios
- profesionales
- grupos del menu lateral

Estas listas permiten aplicar recorridos, filtros, mapeos y reportes.

### Diccionarios u objetos clave:valor

Cada cita, servicio o profesional se representa como un diccionario en Python o como un objeto en JavaScript. Esto permite acceder a campos por nombre, por ejemplo:

- `appointment["status"]`
- `service["price"]`
- `member["name"]`

### Listas de diccionarios

El proyecto usa listas de diccionarios como simulacion de base de datos local. Esta fue la eleccion adecuada porque:

- cada registro tiene varios atributos relacionados
- los nombres de los campos hacen el codigo mas legible
- es mas facil actualizar un solo atributo sin perder el resto del registro
- favorece la generacion de reportes y filtros por clave

Una lista simple por posiciones seria menos clara. Por ejemplo, guardar un servicio como `["Corte Clasico", "Corte", 35000, 30]` obliga a recordar el significado de cada posicion, mientras que un diccionario lo deja explicito con claves como `name`, `category`, `price` y `duration`.

## 5. Conceptos de la guia y ubicacion en el proyecto

### Ciclos `for`

- `backend/app/main.py`: recorrido de los origenes permitidos despues de aplicar `split(",")`
- `backend/app/store.py`: construccion del indice de precios de servicios
- `src/components/Sidebar.jsx`: generacion iterativa del menu con `map()`
- `src/views/Dashboard.jsx`: recorrido de citas y profesionales para mostrar reportes
- `src/views/Appointments.jsx`, `src/views/Services.jsx`, `src/views/Staff.jsx`: renderizado de colecciones con `map()`
- `src/views/MirrorAR.jsx`: varios `for` para dibujar patrones graficos repetitivos

### Ciclos `while`

- `backend/app/store.py`:
  - `_build_initials()` recorre palabras del nombre hasta completar dos iniciales
  - `_build_dashboard_stats()` recorre dinamicamente la agenda del dia
  - `_find_index_by_id()` busca un registro por identificador

### Condicionales `if / else`

- `backend/app/store.py`: validacion de texto, busqueda por id y calculo de estadisticas
- `src/views/Appointments.jsx`: filtrado por estado de cita
- `src/views/Services.jsx`: validacion de formulario
- `src/views/Staff.jsx`: validacion y cambio de estado del profesional
- `src/views/MirrorAR.jsx`: control de fases, deteccion facial y renderizado

### `break` y `continue`

- `backend/app/store.py`:
  - `break` en `_build_initials()` y `_find_index_by_id()` para detener el recorrido cuando ya se encontro el resultado
  - `continue` en `_build_initials()` y `_build_dashboard_stats()` para omitir casos que no deben procesarse en ese momento

### Manipulacion de strings con `split()`, `join()`, `strip()` y `replace()`

- `backend/app/main.py`: `split()` y `strip()` para procesar origenes del backend
- `backend/app/store.py`: `replace()`, `strip()`, `split()` y `join()` en `_normalize_text()`
- `src/lib/api.js`: `replace()`, `split()` y `join()` para normalizar texto y construir iniciales
- `src/views/Appointments.jsx`: `split(' ')` para mostrar solo el primer nombre del profesional en el modal de exito

### Validacion de entradas

- `backend/app/schemas.py`: reglas con `Field(...)` para precios, duraciones, nombres y limites numericos
- `backend/app/store.py`: validacion y normalizacion adicional antes de guardar datos
- `src/views/Services.jsx`: comprobacion de nombre y precio antes de crear un servicio
- `src/views/Staff.jsx`: comprobacion de nombre y rol antes de registrar un profesional

### Manejo de errores

- `backend/app/store.py`: `try/except` en `_normalize_text()` y errores HTTP cuando no se encuentra un registro
- `src/lib/api.js`: `try/catch` en `withFallback()` para activar los datos locales si falla la API
- `src/views/MirrorAR.jsx`: `try/catch` en acceso a camara y deteccion facial

### Menus o flujos iterativos

- `src/components/Sidebar.jsx`: construccion del menu lateral a partir de una coleccion
- `src/views/Appointments.jsx`: flujo de seleccion, escaneo y confirmacion de check-in
- `src/views/MirrorAR.jsx`: fases `idle`, `ar`, `captured` y `error`

### Reportes o recorridos de datos

- `backend/app/store.py`: calculo de ingresos, clientes, ocupacion y profesionales activos
- `src/views/Dashboard.jsx`: visualizacion del reporte general
- `src/views/Appointments.jsx`: tabla de citas filtradas
- `src/views/Services.jsx`: catalogo visual de servicios
- `src/views/Staff.jsx`: tablero del equipo de trabajo

## 6. Explicacion academica de la organizacion

La organizacion del proyecto se mejoro manteniendo la logica principal. El backend concentra la logica de negocio y las validaciones estructurales, mientras que el frontend consume esas colecciones para filtrarlas, transformarlas y mostrarlas como reportes visuales.

La mayor evidencia de la guia esta en `backend/app/store.py`, porque alli se procesan listas de diccionarios de forma controlada y se aplican:

- `for` para crear indices
- `while` para recorridos dinamicos
- `break` y `continue` para controlar el flujo
- validacion y normalizacion de texto
- calculo de indicadores a partir de colecciones

En el frontend, la evidencia se ve principalmente en los componentes que convierten listas de objetos en tablas, tarjetas, menus o indicadores, lo cual demuestra el procesamiento iterativo de colecciones dentro de una aplicacion real.

## 7. Conclusion

El proyecto ya no solo funciona como sistema administrativo, sino tambien como evidencia academica clara de los temas de la semana 5. La documentacion agregada permite identificar rapidamente:

- que estructura de datos se usa
- donde aparecen los recorridos iterativos
- como se validan datos
- donde se manipulan cadenas
- como se generan reportes a partir de colecciones

De esta manera, el codigo queda mas entendible, trazable y adecuado para una revision docente.
