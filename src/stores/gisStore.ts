// src/stores/gisStore.ts

import { defineStore } from 'pinia';
import { api } from 'boot/axios';

// Enum para el estado de la causa
export enum EstadoCausa {
  ESCLARECIDO = 'esclarecido',
  NO_ESCLARECIDO = 'no_esclarecido'
}

// Interfaz para el nuevo modelo de Delito
export interface Delito {
  id?: number;
  articulo?: string | null;
  inciso?: string | null;
  tipoDelito?: string | null;
}

// Interfaz para Imputado
export interface Delincuente {
  id?: number;
  nombre?: string | null;
  dni?: string | null;
}

// Interfaz actualizada para MarcadorSeg
export interface MarcadorSeg {
  id: number;
  nombre: string | null;
  apellido: string | null;
  direccion: string | null;
  telefono: string | null;
  dni: string | null;
  notas: string | null;
  latitud: number;
  longitud: number;
  icono: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  delitos?: Delito[];
  delincuentes?: Delincuente[];
  numero_denuncia: string | null;
  fiscal: string | null;
  barrio: string | null;
  estado_causa?: EstadoCausa | null;
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    allMarcadores: [] as MarcadorSeg[], // <-- Guarda todos los marcadores, sin filtrar
    marcadores: [] as MarcadorSeg[], // <-- La lista que se muestra (VACÍA POR DEFECTO)
    marcadorSeleccionado: null as MarcadorSeg | null,
    añoSeleccionado: new Date().getFullYear(), // <-- Año actual por defecto
  }),

  actions: {
    // 1. 🛑 CAMBIO CLAVE: Carga la base de datos completa, PERO NO actualiza 'marcadores'.
    async cargarDatosBase() {
      if (this.allMarcadores.length > 0) return; // Evitar recargas
      try {
        const response = await api.get('/marcador-seg');
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
        this.allMarcadores = data;
        // 🛑 this.marcadores NO se actualiza aquí. El mapa inicia vacío.
      } catch (error) {
        console.error('Error al cargar datos base desde la API:', error);
        this.allMarcadores = [];
      }
    },

    // 2. NUEVA ACCIÓN: Se usa solo en DatosPage.vue para llenar la tabla
    async cargarDatosParaTabla() {
        await this.cargarDatosBase();
        // Muestra los marcadores del año actual por defecto
        await this.filtrarMarcadoresPorAño(this.añoSeleccionado);
    },

    // 3. Acción de Filtrado
    async filtrarMarcadoresPorFecha(fechaInicio: string, fechaFin: string) {
      await this.cargarDatosBase(); // Asegura que allMarcadores esté listo

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      // Para incluir el día completo de la fecha de fin
      fin.setHours(23, 59, 59, 999);

      this.marcadores = this.allMarcadores.filter((marcador) => {
        if (!marcador.fecha_inicio) return false;
        const fechaMarcador = new Date(marcador.fecha_inicio);
        return fechaMarcador >= inicio && fechaMarcador <= fin;
      });
      this.cerrarInfo();
    },

    // 4. 🚀 CAMBIO CLAVE: Al limpiar el filtro, el mapa/lista se VACÍA.
    limpiarFiltroDeFechas() {
      this.marcadores = []; // <-- Vacía el array para que el mapa quede en blanco
      this.cerrarInfo();
    },

    // 4.5 Nueva acción: Mostrar todos los marcadores del año seleccionado
    async mostrarTodos() {
      await this.cargarDatosBase();
      await this.filtrarMarcadoresPorAño(this.añoSeleccionado);
    },

    // 4.6 Nueva acción: Filtrar marcadores por año
    async filtrarMarcadoresPorAño(año: number) {
      await this.cargarDatosBase();
      this.marcadores = this.allMarcadores.filter((marcador) => {
        if (!marcador.fecha_inicio) return false;
        const fechaMarcador = new Date(marcador.fecha_inicio);
        return fechaMarcador.getFullYear() === año;
      });
      this.cerrarInfo();
    },

    // 4.7 Nueva acción: Cambiar el año seleccionado
    async cambiarAño(año: number) {
      this.añoSeleccionado = año;
      await this.filtrarMarcadoresPorAño(año);
    },

    // 4.8 Getter para obtener años únicos disponibles
    obtenerAñosDisponibles(): number[] {
      const años = new Set<number>();
      this.allMarcadores.forEach((marcador) => {
        if (marcador.fecha_inicio) {
          const año = new Date(marcador.fecha_inicio).getFullYear();
          años.add(año);
        }
      });
      return Array.from(años).sort((a, b) => b - a); // Orden descendente
    },

    // 4.9 Obtener lista única de imputados
    obtenerImputadosUnicos(): Array<{ id: number; nombre: string; dni: string | null }> {
      const imputadosMap = new Map<number, { id: number; nombre: string; dni: string | null }>();
      
      this.allMarcadores.forEach((marcador) => {
        if (marcador.delincuentes && marcador.delincuentes.length > 0) {
          marcador.delincuentes.forEach((delincuente) => {
            if (delincuente.id && delincuente.nombre) {
              imputadosMap.set(delincuente.id, {
                id: delincuente.id,
                nombre: delincuente.nombre,
                dni: delincuente.dni || null,
              });
            }
          });
        }
      });
      
      return Array.from(imputadosMap.values()).sort((a, b) => 
        a.nombre.localeCompare(b.nombre)
      );
    },

    // 4.10 Filtrar marcadores por imputados seleccionados
    async filtrarMarcadoresPorImputados(imputadosIds: number[]) {
      await this.cargarDatosBase();
      
      if (imputadosIds.length === 0) {
        // Si no hay imputados seleccionados, mostrar todos del año actual
        await this.filtrarMarcadoresPorAño(this.añoSeleccionado);
        return;
      }
      
      this.marcadores = this.allMarcadores.filter((marcador) => {
        // Verificar que el marcador sea del año seleccionado
        if (marcador.fecha_inicio) {
          const año = new Date(marcador.fecha_inicio).getFullYear();
          if (año !== this.añoSeleccionado) return false;
        } else {
          return false;
        }
        
        // Verificar que el marcador tenga al menos uno de los imputados seleccionados
        if (!marcador.delincuentes || marcador.delincuentes.length === 0) {
          return false;
        }
        
        return marcador.delincuentes.some((delincuente) => 
          delincuente.id && imputadosIds.includes(delincuente.id)
        );
      });
      
      this.cerrarInfo();
    },

    // 5. Ajustes en CRUD para manejar allMarcadores
    async agregarMarcador(marcador: Omit<MarcadorSeg, 'id'>) {
      try {
        const response = await api.post('/marcador-seg', marcador);
        const nuevoMarcador: MarcadorSeg = response.data;

        this.allMarcadores.push(nuevoMarcador);

        // Si el usuario está viendo la tabla o el mapa filtrado, actualizamos la lista mostrada
        if (this.marcadores.length > 0) {
            this.marcadores = [...this.marcadores, nuevoMarcador];
        }

        this.marcadorSeleccionado = nuevoMarcador;
      } catch (error) {
        console.error('Error al agregar marcador:', error);
        throw error;
      }
    },

    async actualizarMarcador(marcador: MarcadorSeg) {
      try {
        const response = await api.put(`/marcador-seg/${marcador.id}`,
          marcador,
        );
        const marcadorActualizado = response.data;

        // Actualiza `marcadores` (lista mostrada)
        let index = this.marcadores.findIndex((m) => m.id === marcador.id);
        if (index !== -1) {
          this.marcadores[index] = marcadorActualizado;
        }

        // Actualiza `allMarcadores` (lista de datos base)
        index = this.allMarcadores.findIndex((m) => m.id === marcador.id);
        if (index !== -1) {
            this.allMarcadores[index] = marcadorActualizado;
        }

        this.marcadorSeleccionado = marcadorActualizado;
      } catch (error) {
        console.error('Error al actualizar marcador:', error);
        throw error;
      }
    },

    // 6. Ajuste en seleccionarMarcador
    seleccionarMarcador(id: number) {
      // Prioriza buscar en marcadores (la lista visible)
      let marcador = this.marcadores.find((m) => m.id === id);
      if (!marcador) {
         // Si no está visible (ej: limpió el filtro), busca en la lista completa
         marcador = this.allMarcadores.find((m) => m.id === id);
      }
      if (marcador) {
        this.marcadorSeleccionado = marcador;
      } else {
        console.error(`No se encontró el marcador con id: ${id} en el store.`);
      }
    },

    async eliminarMarcador(id: number) {
      try {
        await api.delete(`/marcador-seg/${id}`);
        this.marcadores = this.marcadores.filter((m) => m.id !== id);
        this.allMarcadores = this.allMarcadores.filter((m) => m.id !== id);
        this.marcadorSeleccionado = null;
      } catch (error) {
        console.error('Error al eliminar marcador:', error);
        throw error;
      }
    },

    cerrarInfo() {
      this.marcadorSeleccionado = null;
    },
  },
});
