# Agregar marcador

Este documento explica el flujo para agregar un marcador en el mapa.

## Requisitos

- Tener permisos para crear marcadores.
- Completar los campos obligatorios del formulario.

## Paso a paso

1. En el mapa, hace clic en la ubicacion donde queres crear el marcador.
2. Se abre el panel lateral con el formulario de alta.
3. Completa los datos obligatorios:
   - Nombre
   - Apellido
   - Direccion del hecho
   - Numero de IPP
   - Barrio
   - Fecha
   - Al menos un delito
4. Completa los campos opcionales si corresponde (telefono, fiscal, notas, imputados, etc.).
5. En delitos, agrega uno o mas:
   - Selecciona el tipo de delito.
   - Si corresponde, el articulo e inciso se completan automaticamente.
6. En imputados (opcional):
   - Elegi uno existente desde el selector con buscador, o crea uno nuevo.
   - Los imputados agregados quedan en solo lectura y se pueden eliminar.
7. Presiona "Guardar" para crear el marcador.

## Validaciones principales

- No se permite guardar si falta algun campo obligatorio.
- Debe existir al menos un delito con tipo seleccionado.
- DNI y numero de IPP aceptan solo numeros.

## Resultado

- El marcador se guarda y aparece en la lista visible del mapa.
- Si hay filtros activos, el marcador se agrega a la vista actual.

## Notas

- El icono del marcador se determina automaticamente por el primer delito.
- Si no tenes permisos, el sistema mostrara un aviso y no abrira el formulario.
