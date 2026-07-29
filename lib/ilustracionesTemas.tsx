import { createElement, type ComponentType } from "react";
import { IlustracionPendiente } from "@/components/ilustraciones/IlustracionPendiente";
import { IlustracionBalanza } from "@/components/ilustraciones/IlustracionBalanza";
import { IlustracionEjeNumeros } from "@/components/ilustraciones/ejes/IlustracionEjeNumeros";
import { IlustracionEjeAlgebra } from "@/components/ilustraciones/ejes/IlustracionEjeAlgebra";
import { IlustracionEjeGeometria } from "@/components/ilustraciones/ejes/IlustracionEjeGeometria";
import { IlustracionEjeProbabilidad } from "@/components/ilustraciones/ejes/IlustracionEjeProbabilidad";
import { ejeDeTema } from "@/lib/modulos";

/**
 * La ilustración de cada tema. Mismo criterio y mismo lugar que
 * `lib/descripcionesLecciones.tsx`: es copy visual de interfaz, no contenido
 * pedagógico, así que vive en TypeScript y no en `content/`.
 *
 * **Dos capas, a propósito.** Los temas que ya tienen contenido llevan una
 * ilustración propia —la misma que ya existía para su lección insignia, que es
 * literalmente el dibujo de ese tema—. Los otros catorce caen al placeholder
 * geométrico de su eje.
 *
 * Por qué no dieciséis dibujos distintos: catorce de esos temas no tienen una
 * sola lección escrita. Un dibujo específico para cada uno prometería una
 * especificidad que el contenido todavía no tiene, y sería la mayor parte del
 * trabajo de una sesión para pantallas que hoy nadie abre. El placeholder por
 * eje es honesto: dice "esta es la familia", que es exactamente lo que sabemos.
 */
const POR_TEMA: Record<string, ComponentType> = {
  "funcion-lineal-y-afin": IlustracionPendiente,
  "ecuaciones-e-inecuaciones-primer-grado": IlustracionBalanza,
};

const POR_EJE: Record<string, ComponentType> = {
  numeros: IlustracionEjeNumeros,
  "algebra-y-funciones": IlustracionEjeAlgebra,
  geometria: IlustracionEjeGeometria,
  "probabilidad-y-estadistica": IlustracionEjeProbabilidad,
};

export function ilustracionDeTema(temaId: string): ComponentType {
  const propia = POR_TEMA[temaId];
  if (propia) return propia;
  const eje = ejeDeTema(temaId);
  /* Sin eje conocido cae al de álgebra, que es el plano cartesiano: es la
     figura más neutra del conjunto y el módulo v1 vive ahí. Nunca devuelve
     `undefined` — una pantalla sin ilustración se ve rota, no vacía. */
  return (eje && POR_EJE[eje.id]) ?? IlustracionEjeAlgebra;
}

/**
 * La ilustración de un tema, lista para montar.
 *
 * Usa `createElement` y no una variable local en mayúscula a propósito: las
 * referencias que devuelve `ilustracionDeTema` son constantes de módulo, así
 * que no hay ningún componente creado durante el render, pero asignarlas a un
 * `const Ilustracion` se lo parece a `react-hooks/static-components`. Esto dice
 * lo mismo sin apagar la regla, que en el 99% de los casos tiene razón.
 */
export function IlustracionTema({ temaId }: { temaId: string }) {
  return createElement(ilustracionDeTema(temaId));
}
