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
 * `Partial<Record<LeccionId, ...>>` desde que el registro declara las 48
 * lecciones del temario teniendo 9 escritas: un `Record` total exigiría copy
 * de interfaz para 39 lecciones que todavía no existen, y esa copy se
 * escribiría a ciegas.
 *
 * La garantía que antes daba el `Record` total —un id renombrado o agregado
 * sin actualizar este mapa cae en `RESPALDO` en silencio— la sostiene ahora
 * `__tests__/descripcionesLecciones.test.ts`, que exige entrada propia para
 * toda lección **con archivo en disco**. Es el mismo contrato donde importa,
 * medido contra la realidad en vez de contra el plan.
 */
const CATALOGO: Partial<Record<LeccionId, PresentacionLeccion>> = {
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
  "lineal-modelamiento-paes": {
    descripcion:
      "Parte de un enunciado escrito y arma tú la ecuación: decide qué número es el ritmo y cuál el punto de partida.",
    Ilustracion: IlustracionPlano,
  },
  "ecuaciones-lineales": {
    descripcion:
      "Resuelve ecuaciones pensando en una balanza en equilibrio: lo que haces a un lado, lo haces al otro.",
    Ilustracion: IlustracionBalanza,
  },
  "inecuaciones-resolucion": {
    descripcion:
      "Descubre por qué multiplicar por un número negativo da vuelta una desigualdad, y dibuja el conjunto solución en la recta.",
    Ilustracion: IlustracionPlano,
  },
  "inecuaciones-problemas": {
    descripcion:
      "Traduce frases como \"a lo más\" o \"al menos\" a desigualdades, y decide cuándo la respuesta tiene que ser un número entero.",
    Ilustracion: IlustracionPlano,
  },
  "enteros-operar-y-ordenar": {
    descripcion:
      "Suma y resta enteros pensando en profundidad bajo el agua, y ordénalos en la recta sin confundirte con los signos.",
    Ilustracion: IlustracionPlano,
  },
  "enteros-operar-y-comparar": {
    descripcion:
      "Descubre por qué dividir por una fracción puede agrandar el resultado, y compara fracciones sin mirar solo el numerador.",
    Ilustracion: IlustracionPlano,
  },
  "enteros-problemas-en-contexto": {
    descripcion: "Compara temperaturas bajo cero y calcula variaciones que combinan enteros y fracciones.",
    Ilustracion: IlustracionPlano,
  },
  "porcentaje-concepto": {
    descripcion:
      "Descubre que sacar un porcentaje es multiplicar por un número fijo, moviendo un grupo de estudiantes y viendo qué se mantiene igual.",
    Ilustracion: IlustracionPlano,
  },
  "porcentaje-rebaja-doble": {
    descripcion:
      "Averigua por qué un 20% de descuento seguido de un 10% no es un 30%, y qué se multiplica cuando dos rebajas se aplican una tras otra.",
    Ilustracion: IlustracionPlano,
  },
  "porcentaje-volver-atras": {
    descripcion:
      "Reconstruye el precio original a partir del precio final, y descubre por qué quitar el mismo porcentaje que se sumó nunca te devuelve al punto de partida.",
    Ilustracion: IlustracionPlano,
  },
  "proporcionalidad-directa": {
    descripcion:
      "Descubre la razón fija que conecta dos cantidades que crecen juntas, y úsala para completar la tabla sin memorizar valores sueltos.",
    Ilustracion: IlustracionPlano,
  },
  "proporcionalidad-inversa": {
    descripcion:
      "Reordena un total fijo entre dos cantidades que se mueven en sentido contrario, y descubre qué se mantiene igual cuando una sube y la otra baja.",
    Ilustracion: IlustracionPlano,
  },
  "proporcionalidad-reconocer": {
    descripcion:
      "Ante una tabla sin título, decide con dos pruebas si es directa, inversa o ninguna de las dos — aunque las columnas suban parejo.",
    Ilustracion: IlustracionPlano,
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
 * las claves de `CATALOGO` siguen acotadas a `LeccionId` por su anotación.
 *
 * `RESPALDO` es la salida legítima para las 39 lecciones planeadas que aún no
 * tienen archivo. Para las que sí existen, el test de cobertura garantiza que
 * nunca se llegue acá.
 */
export function presentacionDeLeccion(id: string): PresentacionLeccion {
  return (CATALOGO as Record<string, PresentacionLeccion | undefined>)[id] ?? RESPALDO;
}
