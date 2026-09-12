import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { IngresoErrores } from "@/components/advance/IngresoErrores";
import { ListaErrores } from "@/components/advance/ListaErrores";
import { advanceVisible, estadoAdvance, type EstadoAdvance } from "@/lib/advance/acceso";
import { obtenerBanco, unidadesConBanco } from "@/lib/advance/banco";
import { estadoDeErrores } from "@/lib/advance/dominio";
import { itemsResueltosDe } from "@/lib/advance/itemsResueltos";
import { tarjetasDeUnidad, type GrupoDeUnidad } from "@/lib/advance/pantallaErrores";
import { TEXTOS_ADVANCE } from "@/lib/advance/textos";
import { catalogoDelModulo } from "@/lib/catalogoErrores";
import { listarDescartesDeUsuario } from "@/lib/datos/advanceDescartes";
import { ejeDeTema } from "@/lib/modulos";

export const metadata: Metadata = {
  title: `${TEXTOS_ADVANCE.errores.titulo} · ${TEXTOS_ADVANCE.nombre}`,
  robots: { index: false, follow: false },
};

/* Lee Neon en cada petición: el estado es de un estudiante y cambia con cada
   sesión de descarte. Nada que cachear. */
export const dynamic = "force-dynamic";

/**
 * /advance/errores: el ciclo de vida de los errores del estudiante
 * (docs/fobos-advance.md §6.3), calculado al vuelo desde `advance_descartes`.
 *
 * Mismo orden de guardas que POST /api/advance/sesion. Sin flag, 404. Sin
 * sesión, la pantalla de ingreso, antes de tocar Postgres. Sin acceso, a la
 * puerta, como el resto de /advance. `usuario_id` sale de auth() y de ningún
 * otro lado.
 *
 * Ruta global, sin unidad en la URL (D13): recorre todas las unidades con
 * banco y agrupa por unidad adentro. Una consulta por unidad; hoy hay una.
 * Cada unidad se cruza con su propio catálogo, porque la identidad de un error
 * es (unidad, id local).
 */
export default async function PaginaErrores() {
  if (!advanceVisible()) notFound();

  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="flex min-h-full flex-1 flex-col">
        <IngresoErrores />
      </main>
    );
  }

  const estado: EstadoAdvance = await estadoAdvance();
  switch (estado) {
    case "sin-acceso":
    case "temporada-terminada":
      redirect("/advance/puerta");
    case "activo":
      break;
    default: {
      const nunca: never = estado;
      throw new Error(`Estado de Advance sin manejar: ${nunca}`);
    }
  }

  const grupos: GrupoDeUnidad[] = [];
  for (const { unidadId, titulo } of unidadesConBanco()) {
    const banco = obtenerBanco(unidadId);
    if (!banco) continue;
    const catalogo = catalogoDelModulo(banco.moduloId);
    const filas = await listarDescartesDeUsuario(userId, unidadId);
    const estados = estadoDeErrores([...catalogo.keys()], itemsResueltosDe(filas, banco.items));
    grupos.push({
      unidadId,
      titulo,
      ejeId: ejeDeTema(banco.moduloId)?.id ?? null,
      tarjetas: tarjetasDeUnidad(estados, catalogo),
    });
  }

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <ListaErrores grupos={grupos} />
    </main>
  );
}
