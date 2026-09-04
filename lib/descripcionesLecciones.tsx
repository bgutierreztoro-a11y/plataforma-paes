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
 * lecciones del temario: un `Record` total exigiría copy de interfaz para las
 * 15 que todavía no tienen archivo, y esa copy se escribiría a ciegas.
 * Medido el 2026-09-03: 48 declaradas en `lib/modulos.ts`, 34 archivos en
 * `content/lecciones/` (`l0-demo` entre ellos, que no está declarado), 25
 * entradas acá.
 *
 * **El mapa está incompleto y el test ya no lo persigue.** Hasta la fase 3H,
 * `__tests__/descripcionesLecciones.test.ts` exigía entrada propia para toda
 * lección con archivo en disco. Esa dirección se retiró el 2026-09-03 porque
 * `presentacionDeLeccion` no tiene consumidor de runtime desde la 3G —se borró
 * `CaminoLecciones`, su único llamador, y el marco nuevo de la pantalla 04 no
 * muestra descripción por lección—: pedir cobertura total de un módulo que el
 * producto no monta obligaba a escribir copy para pantallas inexistentes.
 *
 * Lo que el test **sí** sostiene es la dirección contraria, que sigue siendo un
 * defecto real con o sin consumidor: ninguna clave de acá puede apuntar a una
 * lección sin archivo. Un id renombrado o borrado se detecta igual.
 *
 * Qué hacer con este módulo —darle consumidor y volver a exigir cobertura, o
 * borrarlo por muerto— es decisión de contenido y está anotada en
 * `docs/recuento-pantallas-fase-3.md`.
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
  "potencias-multiplicar-corto": {
    descripcion:
      "Descubre cómo subir o bajar un escalón de exponente multiplica o divide por la base, y usa ese patrón para explicar el exponente cero y los negativos.",
    Ilustracion: IlustracionPatrones,
  },
  "potencias-raiz-escondida": {
    descripcion:
      "Reconoce una raíz enésima como una potencia con exponente fraccionario, y úsala para simplificar raíces y descomponerlas en su mayor factor exacto.",
    Ilustracion: IlustracionPatrones,
  },
  "potencias-problemas-en-contexto": {
    descripcion:
      "Decide si un problema pide una potencia o una raíz, y encuentra el resultado o el factor desconocido en situaciones de crecimiento repetido.",
    Ilustracion: IlustracionPlano,
  },
  "expresiones-rectangulo": {
    descripcion:
      "Desarrolla el cuadrado de un binomio viendo por qué el término del medio es exactamente el doble del producto de sus partes.",
    Ilustracion: IlustracionPlano,
  },
  "expresiones-deshacer-producto": {
    descripcion:
      "Reconoce una diferencia de cuadrados y factorízala como el producto de una suma por una resta, comprobando que los términos cruzados se cancelan.",
    Ilustracion: IlustracionBalanza,
  },
  "expresiones-sumar-lo-que-se-parece": {
    descripcion:
      "Reduce una expresión agrupando los términos que comparten la misma parte literal, y decide cuándo ya no se puede simplificar más.",
    Ilustracion: IlustracionPatrones,
  },
  "sistemas-dos-historias": {
    descripcion:
      "Resuelve un sistema de dos ecuaciones por sustitución y encuentra el único par de valores que cumple ambas historias a la vez.",
    Ilustracion: IlustracionBalanza,
  },
  "sistemas-rectas-no-se-cruzan": {
    descripcion:
      "Reconoce en los coeficientes de un sistema cuándo las rectas nunca se cruzan y cuándo son la misma recta escrita de dos formas.",
    Ilustracion: IlustracionPendiente,
  },
  "sistemas-plantear-antes-resolver": {
    descripcion:
      "Traduce un problema en palabras a un sistema de dos ecuaciones, incluyendo condiciones de 'hace n años' o 'dentro de n años', y resuélvelo.",
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
 * las claves de `CATALOGO` siguen acotadas a `LeccionId` por su anotación.
 *
 * `RESPALDO` es la salida legítima para las 15 lecciones planeadas que aún no
 * tienen archivo — y también, desde el 2026-09-03, para 9 que sí lo tienen: el
 * test dejó de exigir cobertura total y nada garantiza ya que no se llegue acá
 * con una lección escrita. Ver la nota de `CATALOGO`, arriba. Hoy da lo mismo en
 * la práctica, porque esta función no la llama nadie en runtime.
 */
export function presentacionDeLeccion(id: string): PresentacionLeccion {
  return (CATALOGO as Record<string, PresentacionLeccion | undefined>)[id] ?? RESPALDO;
}
