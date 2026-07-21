import type { ComponentType } from "react";
import { IlustracionPlano } from "@/components/ilustraciones/IlustracionPlano";
import { IlustracionPatrones } from "@/components/ilustraciones/IlustracionPatrones";
import { IlustracionPendiente } from "@/components/ilustraciones/IlustracionPendiente";
import { IlustracionBalanza } from "@/components/ilustraciones/IlustracionBalanza";

interface PresentacionLeccion {
  /* 1–2 líneas: qué aprende el estudiante. Copy de interfaz, no contenido
     pedagógico — por eso vive aquí y no en el JSON de la lección. */
  descripcion: string;
  Ilustracion: ComponentType;
}

const CATALOGO: Record<string, PresentacionLeccion> = {
  "l0-demo": {
    descripcion:
      "Un recorrido corto para conocer cómo funcionan las lecciones: preguntas, pistas y descubrimiento paso a paso.",
    Ilustracion: IlustracionPlano,
  },
  "l1-patrones-de-cambio": {
    descripcion:
      "Reconoce el cambio constante en secuencias y tablas: la idea que está detrás de toda función lineal.",
    Ilustracion: IlustracionPatrones,
  },
  "l2-pendiente-e-intercepto": {
    descripcion:
      "Mueve una recta real con tus manos y descubre qué controlan la pendiente y el intercepto.",
    Ilustracion: IlustracionPendiente,
  },
  "l3-ecuaciones-lineales": {
    descripcion:
      "Resuelve ecuaciones pensando en una balanza en equilibrio: lo que haces a un lado, lo haces al otro.",
    Ilustracion: IlustracionBalanza,
  },
};

const RESPALDO: PresentacionLeccion = {
  descripcion: "Una lección interactiva de funciones lineales, paso a paso.",
  Ilustracion: IlustracionPlano,
};

export function presentacionDeLeccion(id: string): PresentacionLeccion {
  return CATALOGO[id] ?? RESPALDO;
}
