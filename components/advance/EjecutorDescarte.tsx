"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlternativaDescartable } from "@/components/advance/AlternativaDescartable";
import { Boton } from "@/components/ui/linea/Boton";
import { BarraProgreso } from "@/components/ui/linea/BarraProgreso";
import { PanelFeedback } from "@/components/ui/PanelFeedback";
import { TARJETA_LINEA } from "@/components/ui/linea/tarjetas";
import {
  estadoInicialItem,
  itemCerrado,
  payloadDescarteAlternativa,
  payloadDescarteFatal,
  payloadDescarteFin,
  payloadDescarteInicio,
  reducerItem,
  registroDe,
  type EstadoItem,
  type ItemAdvance,
  type PayloadDescarteAlternativa,
  type PayloadDescarteFatal,
  type PayloadDescarteFin,
  type PayloadDescarteInicio,
  type RegistroItem,
} from "@/lib/advance/descarte";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { TextoEnriquecido } from "@/lib/markdownSimple";
import { rotuloDeError } from "@/lib/progresoSesion";
import type { ClaveAlternativa } from "@/lib/tipos";

interface EjecutorDescarteProps {
  items: ItemAdvance[];
  unidadId: string;
  renderFinal: (registros: RegistroItem[]) => ReactNode;
  /* Analítica. Todas opcionales y ninguna se llama desde adentro con
     `registrarEvento`: los payloads salen de lib/advance/descarte.ts y quien
     los envía es la ruta. La galería monta el ejecutor sin callbacks y no
     emite nada. */
  alIniciar?: (payload: PayloadDescarteInicio) => void;
  alDescartar?: (payload: PayloadDescarteAlternativa) => void;
  alFatal?: (payload: PayloadDescarteFatal) => void;
  alTerminar?: (payload: PayloadDescarteFin) => void;
}

/**
 * Una sesión de descarte: un ítem por pantalla, en orden, y al final la
 * pantalla que reciba `renderFinal` con el registro de cada ítem (§6.1).
 *
 * Toma de `EjecutorSetItems` la estructura de navegación (pill, conteo, barra,
 * un ítem a la vez, `renderFinal`), no el manejo de respuesta: acá no hay
 * "comprobar", cada toque se evalúa al instante contra el motor puro de
 * lib/advance/descarte.ts.
 *
 * El reloj es `performance.now()` al montar cada ítem, tomado en el
 * inicializador de estado: corre en el cliente al hidratar, que es cuando el
 * ítem pasa a ser interactivo. El estado no se rinde, así que la diferencia con
 * el valor del servidor no produce desajuste de hidratación.
 */
export function EjecutorDescarte({
  items,
  unidadId,
  renderFinal,
  alIniciar,
  alDescartar,
  alFatal,
  alTerminar,
}: EjecutorDescarteProps) {
  const [indice, setIndice] = useState(0);
  const [registros, setRegistros] = useState<RegistroItem[]>([]);
  const [estado, setEstado] = useState<EstadoItem | null>(() =>
    items.length > 0 ? estadoInicialItem(items[0], performance.now()) : null,
  );

  /* Una vez por montaje, como `leccion_inicio` en RunnerLeccion.tsx: el guard
     evita el doble efecto de StrictMode en desarrollo. */
  const yaInicio = useRef(false);
  useEffect(() => {
    if (yaInicio.current) return;
    yaInicio.current = true;
    alIniciar?.(payloadDescarteInicio(unidadId, items.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const { descarte } = TEXTOS_ADVANCE;

  if (indice >= items.length || estado === null) {
    return <>{renderFinal(registros)}</>;
  }

  const item = items[indice];
  const esUltimo = indice === items.length - 1;
  const cerrado = itemCerrado(estado);

  function descartar(clave: ClaveAlternativa) {
    if (!estado) return;
    const enMs = performance.now();
    const payload = payloadDescarteAlternativa(estado, clave, enMs);
    if (!payload) return;
    const siguiente = reducerItem(estado, { type: "DESCARTAR", clave, enMs });
    setEstado(siguiente);
    alDescartar?.(payload);
    const fatal = payloadDescarteFatal(siguiente);
    if (fatal) alFatal?.(fatal);
  }

  function confirmar() {
    if (!estado) return;
    setEstado(reducerItem(estado, { type: "CONFIRMAR", enMs: performance.now() }));
  }

  function avanzar() {
    if (!estado) return;
    const acumulados = [...registros, registroDe(estado)];
    setRegistros(acumulados);
    if (esUltimo) {
      alTerminar?.(payloadDescarteFin(unidadId, acumulados));
      setEstado(null);
      setIndice(items.length);
      return;
    }
    setEstado(estadoInicialItem(items[indice + 1], performance.now()));
    setIndice(indice + 1);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[var(--linea-fondo)] px-2.5 py-1 text-etiqueta uppercase text-[var(--linea-contraste)]">
          {descarte.pill}
        </span>
        {/* `text-primary` y no el `text-secondary` de EjecutorSetItems: sobre el
            fondo de página el gris da 4,42 (docs/deuda-contraste-etiquetas.md §1). */}
        <span className="num shrink-0 text-etiqueta uppercase text-primary">
          {descarte.sustantivo} {indice + 1} de {items.length}
        </span>
      </div>
      <div className="mb-8">
        <BarraProgreso
          valor={indice}
          total={items.length}
          etiqueta={`${descarte.sustantivo} ${indice + 1} de ${items.length}`}
        />
      </div>

      <div className="space-y-5" data-item-id={item.id}>
        <div className="text-base font-medium text-primary">
          <TextoEnriquecido contenido={item.enunciado} />
        </div>

        <p className="text-cuerpo-s text-primary">{descarte.instruccion}</p>

        <div className="space-y-2.5" role="group" aria-label="Alternativas">
          {item.alternativas.map((alt) => (
            <AlternativaDescartable
              key={alt.clave}
              alternativa={alt}
              estado={estado.estados[alt.clave]}
              rotuloError={alt.esCorrecta ? undefined : rotuloDeError(alt.errorCatalogado, 1)}
              deshabilitada={cerrado}
              onDescartar={descartar}
            />
          ))}
        </div>

        {estado.fase === "confirmar" && (
          <Boton variante="linea" onClick={confirmar} data-accion="confirmar">
            {descarte.confirmar}
          </Boton>
        )}

        {estado.fase === "cerrado-confirmado" && (
          <PanelFeedback tono="acierto" rotulo={descarte.confirmada}>
            {descarte.confirmadaDetalle}
          </PanelFeedback>
        )}

        {/* La solución no va en `PanelFeedback`: ese panel envuelve a sus hijos
            en un `<p>` y `TextoEnriquecido` emite párrafos. Misma tarjeta y el
            mismo rótulo en versalitas, armados a mano sobre `TARJETA_LINEA`. */}
        {estado.fase === "cerrado-fatal" && (
          <div role="status" className={`${TARJETA_LINEA} px-[13px] py-3`} data-solucion>
            <p className="text-etiqueta uppercase text-secondary">{descarte.solucion}</p>
            <div className="mt-1.5 text-sm leading-relaxed text-primary">
              <TextoEnriquecido contenido={item.solucion} />
            </div>
          </div>
        )}

        {cerrado && (
          <Boton variante="linea" onClick={avanzar} data-accion="avanzar">
            {esUltimo ? descarte.terminar : descarte.siguiente}
          </Boton>
        )}
      </div>
    </div>
  );
}
