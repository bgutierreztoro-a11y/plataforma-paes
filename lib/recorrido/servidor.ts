/**
 * La parte del recorrido que lee disco, entorno o Clerk. SOLO SERVIDOR: nada que corra en el
 * cliente puede importarlo con un import de valor (lee content/ con fs, como lib/advance/banco.ts).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { currentUser } from "@clerk/nextjs/server";
import { lineaDeEje, type LineaId } from "@/components/ui/linea/colores";
import { advanceVisible } from "@/lib/advance/acceso";
import { obtenerBanco } from "@/lib/advance/banco";
import { temaDelCaminoPorId } from "@/lib/camino";
import { otorgarEntitlementGratis } from "@/lib/datos/entitlements";
import { crearUsuario, obtenerUsuarioPorClerkId } from "@/lib/datos/usuarios";
import type { FilaPerfilInicio } from "@/lib/datos/perfilInicio";
import type { TipoParada } from "@/lib/eventos";
import { primeraParada, TEXTO_MOTIVO, type ContextoParada, type Parada } from "./primeraParada";
import { ETIQUETA_ALTERNATIVA, ETIQUETA_PARADA } from "./textosBienvenida";
import { moduloDePartida, type UnidadDag } from "./unidadesDag";

/* Mismo número que ITEMS_POR_SESION en app/advance/descarte/[unidadId]/page.tsx. */
const ITEMS_POR_SESION_DESCARTE = 5;
/* El diagnóstico se anuncia en la portada como "Cinco preguntas, unos cinco minutos" (PuntoDePartida.tsx). */
const MINUTOS_DIAGNOSTICO = 5;

function leerUnidadesDag(): UnidadDag[] {
  const ruta = path.join(process.cwd(), "content", "diagnostico", "dag-m1.json");
  return (JSON.parse(readFileSync(ruta, "utf8")) as { unidades: UnidadDag[] }).unidades;
}

export function contextoParada(unidadOrigen: string | null): ContextoParada {
  return {
    unidadOrigen,
    moduloPartida: moduloDePartida(leerUnidadesDag()),
    advanceVisible: advanceVisible(),
    tieneBanco: (modulo) => existsSync(path.join(process.cwd(), "content", "advance", modulo, "banco.json")),
    leccionBase: (modulo) => temaDelCaminoPorId(modulo)?.lecciones[0]?.id ?? null,
  };
}

export interface VistaParada {
  tipo: TipoParada;
  destino: string;
  etiqueta: string;
  estacion: string | null;
  linea: LineaId | null;
  minutos: number | null;
}

export interface VistaPrimeraParada {
  recomendada: VistaParada;
  alternativas: VistaParada[];
  motivo: string | null;
}

function minutosDe(p: Parada): number | null {
  if (p.tipo === "diagnostico") return MINUTOS_DIAGNOSTICO;
  if (!p.modulo) return null;
  if (p.tipo === "leccion") {
    return temaDelCaminoPorId(p.modulo)?.lecciones.find((l) => `/leccion/${l.id}` === p.destino)?.minutos ?? null;
  }
  if (p.tipo === "descarte") {
    const items = obtenerBanco(p.modulo)?.items ?? [];
    if (items.length === 0) return null;
    const promedioSeg = items.reduce((suma, i) => suma + i.tiempoReferenciaSeg, 0) / items.length;
    return Math.round((ITEMS_POR_SESION_DESCARTE * promedioSeg) / 60);
  }
  return null;
}

function vista(p: Parada, etiquetas: Readonly<Record<TipoParada, string>>): VistaParada {
  const tema = p.modulo ? temaDelCaminoPorId(p.modulo) : undefined;
  return {
    tipo: p.tipo,
    destino: p.destino,
    etiqueta: etiquetas[p.tipo],
    estacion: tema?.nombre ?? null,
    linea: tema ? (lineaDeEje(tema.ejeId) ?? null) : null,
    minutos: minutosDe(p),
  };
}

/**
 * Lo que muestra la tarjeta, recalculado desde las respuestas guardadas: si Advance se apagó o
 * cambió el contenido, la tarjeta apunta a algo que funciona hoy. Lo que se recomendó al
 * guardar queda igual en perfil_inicio, que es el registro que mide el embudo.
 */
export function vistaDelPerfil(
  perfil: Pick<FilaPerfilInicio, "p1" | "p2" | "p3" | "unidad_origen">,
): VistaPrimeraParada {
  const pp = primeraParada(perfil, contextoParada(perfil.unidad_origen));
  return {
    recomendada: vista(pp.recomendada, ETIQUETA_PARADA),
    alternativas: pp.alternativas.map((a) => vista(a, ETIQUETA_ALTERNATIVA)),
    motivo: pp.motivo ? TEXTO_MOTIVO[pp.motivo] : null,
  };
}

/**
 * La fila de usuarios con las mismas funciones del webhook (ADR-04), por si /bienvenida carga
 * antes de que llegue user.created. Las dos son idempotentes. El correo sale de Clerk en el
 * servidor, nunca del cliente.
 */
export async function asegurarUsuario(usuarioId: string): Promise<void> {
  if (await obtenerUsuarioPorClerkId(usuarioId)) return;
  const usuario = await currentUser();
  const correo = usuario?.primaryEmailAddress?.emailAddress;
  if (!usuario || usuario.id !== usuarioId || !correo) {
    throw new Error("asegurarUsuario: Clerk no entregó el correo primario de la sesión");
  }
  const nombre = [usuario.firstName, usuario.lastName].filter(Boolean).join(" ") || null;
  await crearUsuario(usuarioId, correo, nombre);
  await otorgarEntitlementGratis(usuarioId);
}
