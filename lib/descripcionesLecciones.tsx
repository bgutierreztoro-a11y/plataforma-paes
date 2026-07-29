import type { ComponentType } from "react";
import { IlustracionPlano } from "@/components/ilustraciones/IlustracionPlano";
import { IlustracionPatrones } from "@/components/ilustraciones/IlustracionPatrones";
import { IlustracionPendiente } from "@/components/ilustraciones/IlustracionPendiente";
import { IlustracionBalanza } from "@/components/ilustraciones/IlustracionBalanza";
import type { LeccionId } from "@/lib/modulos";

interface PresentacionLeccion {
  /* 1–2 líneas: qué aprende el estudiante. Copy de interfaz, no contenido
     pedagógico — por eso vive aquí y no en el JSON de la lección. */
  descripcion: string;
  Ilustracion: ComponentType;
}

/**
 * `Record<LeccionId, ...>` a propósito: un id que se renombra o se agrega en
 * `lib/modulos.ts` sin actualizar este mapa rompe el build (falta o sobra una
 * propiedad), en vez de caer en `RESPALDO` en silencio.
 */
const CATALOGO: Record<LeccionId, PresentacionLeccion> = {
  "l0-demo": {
    descripcion:
      "Un recorrido corto para conocer cómo funcionan las lecciones: preguntas, pistas y descubrimiento paso a paso.",
    Ilustracion: IlustracionPlano,
  },
  "lineal-patrones-de-cambio": {
    descripcion:
      "Reconoce el cambio constante en secuencias y tablas: la idea que está detrás de toda función lineal.",
    Ilustracion: IlustracionPatrones,
  },
  "lineal-pendiente-e-intercepto": {
    descripcion:
      "Mueve una recta real con tus manos y descubre qué controlan la pendiente y el intercepto.",
    Ilustracion: IlustracionPendiente,
  },
  "ecuaciones-lineales": {
    descripcion:
      "Resuelve ecuaciones pensando en una balanza en equilibrio: lo que haces a un lado, lo haces al otro.",
    Ilustracion: IlustracionBalanza,
  },
};

const RESPALDO: PresentacionLeccion = {
  descripcion: "Una lección interactiva de funciones lineales, paso a paso.",
  Ilustracion: IlustracionPlano,
};

/**
 * Recibe `string` y no `LeccionId` a propósito: el llamador trae el id de un
 * `Leccion` leído de disco en runtime, no un literal verificado por el
 * compilador. El cast acá adentro es el único lugar donde se relaja el tipo;
 * `CATALOGO` en sí sigue exhaustivamente chequeado contra `LeccionId`.
 */
export function presentacionDeLeccion(id: string): PresentacionLeccion {
  return (CATALOGO as Record<string, PresentacionLeccion | undefined>)[id] ?? RESPALDO;
}
