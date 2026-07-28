"use client";

import { useEffect, useRef } from "react";
import { Boton } from "@/components/ui/Boton";
import { AvisoCierreDemostracion } from "@/components/ui/Banner";
import { alcanzaDominio } from "@/lib/umbrales";
import { registrarEvento } from "@/lib/eventos";
import type { RespuestaRegistrada } from "@/lib/estadoSetItems";

/* Mismo estilo que el enlace "← Salir al camino" de RunnerLeccion.tsx: la
   opción discreta de esta pantalla no es un tercer botón del mismo peso que
   los otros dos, es un enlace de texto. No es <Link> porque no navega directo
   — dispara analítica y un handler antes. */
const CLASE_ENLACE_DISCRETO =
  "mt-4 inline-flex text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Una de las dos tarjetas del cierre. Exactamente dos: el número que importa y
 *  dónde queda dentro del tema. Nada de XP, puntos ni monedas — lista negra del
 *  MOS, y además desviarían la atención del único dato accionable. */
function TarjetaDato({
  etiqueta,
  valor,
  detalle,
}: {
  etiqueta: string;
  /* ReactNode y no string: el monoespaciado es solo para las cifras, y las
     palabras que van entre ellas ("de") se pintan en sans. */
  valor: React.ReactNode;
  detalle: string;
}) {
  return (
    <div className="rounded-tarjeta border border-border bg-surface p-5 text-left shadow-tarjeta">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-tenue">{etiqueta}</p>
      {/* Cifras tabulares: el número no cambia de ancho entre lecciones. */}
      <p className="mt-1 text-3xl font-semibold text-ink">{valor}</p>
      <p className="mt-1 text-sm leading-6 text-ink-suave">{detalle}</p>
    </div>
  );
}

/**
 * Cierre de una lección: dos tarjetas y una decisión de tres caminos —
 * avanzar, repetir la lección completa, o repetir solo estas preguntas.
 *
 * El umbral **no bloquea nada**. Los tres caminos están siempre disponibles en
 * las dos ramas; lo que cambia con el umbral es cuál se propone primero, no
 * qué se permite: bloquear contenido por puntaje está en la lista negra del
 * MOS.
 */
export function ItemsPAESFinal({
  respuestas,
  leccionId,
  temaNombre,
  ordinalLeccion,
  totalLeccionesTema,
  onRepasar,
  onRepetirCierre,
  onContinuar,
  siguienteLeccionId,
  cierreEnDemostracion = false,
}: {
  respuestas: RespuestaRegistrada[];
  leccionId: string;
  temaNombre: string;
  ordinalLeccion: number;
  totalLeccionesTema: number;
  onRepasar: () => void;
  /* Repite solo el cierre (itemsPAES), sin rehacer los 10 pasos. */
  onRepetirCierre: () => void;
  onContinuar: () => void;
  /* Presente solo si hay una siguiente lección publicable en el camino
     completo — decide el copy del botón/enlace de avance. */
  siguienteLeccionId?: string;
  /* Solo aplica cuando el destino de "Continuar" es /cierre. */
  cierreEnDemostracion?: boolean;
}) {
  const total = respuestas.length;
  const aciertos = respuestas.filter((r) => r.correcta).length;
  const conDominio = alcanzaDominio(aciertos, total);
  const copyAvanzar = siguienteLeccionId ? "Siguiente lección" : "Seguir al camino";

  /* Esta pantalla solo se monta una vez, cuando EjecutorSetItems agota los
     ítems (ver su condición `indiceActual >= items.length`): no hay
     re-render que vuelva a poner indiceActual atrás, así que el montaje es
     el evento real de "llegó al resultado", igual que leccion_inicio en
     RunnerLeccion.tsx.
     El `ref` es el mismo guardia que ya usa CelebracionTema.tsx contra el
     modo estricto de desarrollo, que monta dos veces: verificado en el
     navegador que sin él este evento se duplicaba (dos entradas idénticas en
     consola por una sola pantalla), y `leccion_terminada` alimenta una tasa
     de término — contarla dos veces la infla. */
  const yaRegistrado = useRef(false);
  useEffect(() => {
    if (yaRegistrado.current) return;
    yaRegistrado.current = true;
    registrarEvento({
      nombre: "leccion_terminada",
      props: { leccion_id: leccionId, aciertos, total, sobre_umbral: conDominio },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una sola vez, al montar esta pantalla
  }, []);

  /* A diferencia de cuando solo había un botón en la rama con dominio, ahora
     las tres opciones son una decisión real en las dos ramas: los tres
     eventos se registran siempre, no solo bajo el umbral. */
  function repasar() {
    registrarEvento({ nombre: "repaso_elegido", props: { leccion_id: leccionId } });
    onRepasar();
  }

  function continuar() {
    registrarEvento({ nombre: "camino_elegido", props: { leccion_id: leccionId } });
    onContinuar();
  }

  function repetirCierre() {
    registrarEvento({ nombre: "cierre_repetido_elegido", props: { leccion_id: leccionId } });
    onRepetirCierre();
  }

  return (
    <div className="fondo-cuadricula cuadricula-desvanecida flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {conDominio ? "Lección terminada" : "Lección terminada, y hay algo que afinar"}
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TarjetaDato
            etiqueta="Aciertos"
            valor={<span className="font-mono tabular-nums">{`${aciertos}/${total}`}</span>}
            detalle="Preguntas formato PAES de esta lección."
          />
          <TarjetaDato
            etiqueta="Tu avance"
            valor={
              <>
                <span className="font-mono tabular-nums">{ordinalLeccion}</span>
                <span className="px-1.5 text-2xl text-ink-suave">de</span>
                <span className="font-mono tabular-nums">{totalLeccionesTema}</span>
              </>
            }
            detalle={`Lecciones de ${temaNombre}.`}
          />
        </div>

        {conDominio ? (
          <>
            <p className="mt-6 text-base leading-7 text-ink-suave">
              Lo que viste acá quedó sólido.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Boton onClick={continuar}>{copyAvanzar}</Boton>
              <Boton variante="secundario" onClick={repasar}>
                Repasar esta lección
              </Boton>
            </div>
            <button type="button" onClick={repetirCierre} className={CLASE_ENLACE_DISCRETO}>
              Repetir solo las preguntas
            </button>
          </>
        ) : (
          <>
            {/* Tono de guía, jamás de reproche (MASTER.md §4): nombra el hecho y
                ofrece la salida, no califica a la persona. */}
            <p className="mt-6 text-base leading-7 text-ink-suave">
              Varias se te escaparon. Rehacer la lección ahora es lo que más rinde: no
              pierdes nada de lo que ya hiciste, y el camino te espera igual.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Boton onClick={repasar}>Repasar esta lección</Boton>
              <Boton variante="secundario" onClick={repetirCierre}>
                Repetir solo las preguntas
              </Boton>
            </div>
            <button type="button" onClick={continuar} className={CLASE_ENLACE_DISCRETO}>
              {copyAvanzar}
            </button>
          </>
        )}

        {cierreEnDemostracion && (
          <div className="mt-6 text-left">
            <AvisoCierreDemostracion />
          </div>
        )}
      </div>
    </div>
  );
}
