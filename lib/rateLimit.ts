/**
 * Rate limit en memoria, ventana deslizante, por identidad.
 *
 * Por qué no @upstash/ratelimit: exige una instancia de Redis, dos
 * dependencias y dos variables de entorno nuevas, y CLAUDE.md pide cero
 * dependencias salvo justificación. Lo que hay que proteger es un webhook cuya
 * defensa principal ya es la firma; esto es la segunda capa que pide el MOS,
 * no la única.
 *
 * CÓMO SE USA, QUE NO ES LO OBVIO. Esto NO cuenta todas las peticiones: cuenta
 * solo las que fallan la verificación de firma. La razón es concreta: Clerk
 * manda sus webhooks a través de Svix, y Svix publica un conjunto pequeño,
 * fijo y estable de IPs de origen por región. O sea que TODO el tráfico
 * legítimo llega desde dos o tres IPs. Un limitador por IP aplicado a todo
 * metería los eventos reales en el mismo balde, y un curso entero
 * registrándose durante la misma clase empezaría a perder registros. Contando
 * solo los fallos, el tráfico firmado nunca se ve afectado y el atacante sin
 * el secreto se queda en 429 baratos.
 *
 * Límite real y conocido: el estado vive en el proceso. Vercel Fluid Compute
 * reutiliza instancias pero puede correr varias en paralelo, así que el techo
 * efectivo es `LIMITE × instancias activas`, no `LIMITE`. Para un piloto por
 * link con una cohorte pequeña alcanza. Si esto se abre al público o aparece
 * un DoS real, el siguiente paso es una regla del WAF de Vercel —
 * configuración de plataforma, sin dependencia nueva — antes que pensar en
 * Redis.
 */
const VENTANA_MS = 60_000;
const LIMITE = 10;
const MAX_IDENTIDADES = 10_000; // techo de memoria: la tabla no crece sin fin

const golpes = new Map<string, number[]>();

export interface ResultadoRateLimit {
  permitido: boolean;
  restantes: number;
  reintentarEnSegundos: number;
}

export function consultarRateLimit(identidad: string): ResultadoRateLimit {
  const ahora = Date.now();
  const desde = ahora - VENTANA_MS;

  // Barrido perezoso: solo cuando la tabla se pasa del techo, y solo de las
  // identidades cuya ventana ya venció por completo.
  if (golpes.size > MAX_IDENTIDADES) {
    for (const [clave, marcas] of golpes) {
      if (marcas.every((m) => m <= desde)) golpes.delete(clave);
    }
  }

  const recientes = (golpes.get(identidad) ?? []).filter((m) => m > desde);

  if (recientes.length >= LIMITE) {
    const masViejo = recientes[0];
    golpes.set(identidad, recientes);
    return {
      permitido: false,
      restantes: 0,
      reintentarEnSegundos: Math.max(1, Math.ceil((masViejo + VENTANA_MS - ahora) / 1000)),
    };
  }

  recientes.push(ahora);
  golpes.set(identidad, recientes);

  return {
    permitido: true,
    restantes: LIMITE - recientes.length,
    reintentarEnSegundos: 0,
  };
}
