/**
 * Todo el copy de Fobos Advance vive acá para revisarlo en un solo diff.
 *
 * Reglas (docs/fobos-advance.md §7.1 y §7.3): sin urgencia, sin cuenta
 * regresiva, sin cupos, sin promesa de puntaje, sin letra chica, sin fecha.
 * "PAES" y "DEMRE" solo en uso descriptivo.
 *
 * Precio: no hay ningún texto de precio en F1, ni número ni marcador. El texto
 * definitivo de la puerta depende de la respuesta legal pendiente (§7.1, Ley
 * 21.719) y de la decisión de firma §11.2. Cualquier texto sobre precio requiere
 * firma de Benja y lo escribe él cuando esa decisión esté tomada.
 */
export const TEXTOS_ADVANCE = {
  nombre: "Fobos Advance",

  tramo: {
    titulo: "Fobos Advance",
    activo: "Con acceso. Entrenar para rendir la prueba",
    sinAcceso: "Sin acceso. Qué es y cómo funciona",
  },

  puerta: {
    titulo: "Fobos Advance",
    tesis: "Fobos enseña la materia. Fobos Advance enseña a rendir la prueba.",
    queEs:
      "Es una capa de entrenamiento posterior al aprendizaje. Cada alternativa incorrecta de una pregunta corresponde a un error concreto: Advance te muestra cuál cometiste y cómo dejar de cometerlo.",
    queNoEs:
      "No es más contenido ni un curso paralelo. No es un tutor de inteligencia artificial. No tiene puntos, rachas ni ranking.",
    volverAlEje: "Volver a la línea",
    volverALaRed: "Volver a la red",
  },

  portada: {
    titulo: "Fobos Advance",
    vacio: "Todavía no hay entrenamientos disponibles.",
    detalle: "Cuando los haya, van a aparecer acá.",
    /* Con al menos un banco: una sesión de descarte y una de triage por unidad. */
    conBancos:
      "Entrenamiento de descarte, cinco ítems por sesión. Triage de 20 segundos, veinte ítems por sesión.",
    /* Recibe el `titulo` del banco (nombre técnico DEMRE), nunca el unidadId. */
    sesion: (titulo: string) => `Descarte: ${titulo}`,
    triage: (titulo: string) => `Triage: ${titulo}`,
  },

  /* Modo descarte (docs/fobos-advance.md §6.1). Cada descarte se evalúa al
     instante y es irreversible; el copy lo dice una vez, en la instrucción, y
     no lo repite en cada alternativa. El descarte fatal se informa sin
     dramatismo: es el único error real de la mecánica y es información, no
     castigo. Sin celebración al confirmar. */
  descarte: {
    pill: "Descarte",
    sustantivo: "Ítem",
    instruccion: "Descarta las alternativas que no pueden ser. Cada descarte se evalúa al instante y no se deshace.",
    /* Prefijo del estado anunciado por texto: "Descartada: Error 07". */
    descartada: "Descartada",
    descartadaPorError: "Descartada por error. Era la correcta.",
    sobreviviente: "Queda esta.",
    confirmar: "Confirmar",
    confirmada: "Correcta",
    confirmadaDetalle: "Descartaste las tres que no podían ser.",
    solucion: "Solución",
    siguiente: "Siguiente ítem",
    terminar: "Terminar la sesión",
  },

  /* Pantalla final de la sesión (§6.1): tres preguntas en este orden y nada
     más. Sin porcentajes, sin celebración. */
  resultado: {
    titulo: "Sesión terminada",
    comoTeFue: "Cómo te fue",
    /* Los números van aparte, en la clase `num`; acá solo las palabras. */
    items: (n: number) => (n === 1 ? "ítem" : "ítems"),
    descartesAcertados: (n: number) => (n === 1 ? "descarte acertado" : "descartes acertados"),
    queError: "Qué error apareció más",
    sinDescartes: "No hubo descartes acertados en esta sesión, así que no hay un error que destacar.",
    queHacer: "Qué hacer ahora",
    queHacerDetalle:
      "Vuelve a leer el error de arriba y haz otra sesión: son cinco ítems nuevos de la misma unidad.",
    queHacerSinError: "Haz otra sesión: son cinco ítems nuevos de la misma unidad.",
    otraSesion: "Otra sesión",
    volver: "Volver a Advance",
  },

  /* Pantalla /advance/errores (§6.3, F4). Los nombres de fase son los que ve
     el estudiante (D8): "cerrado" no comunica logro y no se usa. La recaída se
     dice con palabras (D11), y p(L) no se muestra (D10). Título "Por repasar"
     desde F4b: con la tarjeta tocable, "Tus errores" ya no describe la acción
     de la pantalla tan bien como el nombre de la primera fase. */
  errores: {
    titulo: "Por repasar",
    fase: {
      "por-repasar": "Por repasar",
      "en-estudio": "En estudio",
      superado: "Superado",
    },
    recaida: "Volvió a aparecer",
    /* Sin tarjetas (D9): sin ilustración, sin llamada a la acción inventada. */
    vacioTitulo: "Todavía no hay errores por repasar",
    vacioCuerpo:
      "A medida que avances en las sesiones de descarte, tus errores se van a ir acumulando acá.",
    /* Sin sesión de Clerk. No se muestra el vacío: sería mentira. */
    ingresoTitulo: "Ingresa para ver tus errores",
    ingresoCuerpo: "Tus errores se guardan en tu cuenta. Ingresa y vas a ver acá lo que llevas trabajado.",
    ingresar: "Ingresar",
    /* Pantalla /advance/errores/[unidadId]/[errorId] (F4b): el repaso de un
       error. camino/correcto/ejemplo son los rótulos de las tres secciones del
       catálogo (content/errores/<modulo>.json), en ese orden. */
    repaso: {
      camino: "Cómo se comete",
      correcto: "Lo correcto",
      ejemplo: "Ejemplo",
      practicar: "Practicar este error",
      volver: "Volver a la lista",
      /* Catálogos sin repaso todavía (todos menos porcentaje): sin esto la
         pantalla sería h1 + dos botones con un hueco en medio. */
      sinRepaso: "Todavía no hay repaso para este error.",
    },
  },

  /* Triage de 20 segundos (docs/fobos-advance.md §6.5, F5a). Se muestra un
     ítem, corre una cuenta de 20 s y el estudiante decide; no resuelve nada.
     Las tres decisiones pesan igual: ninguna es "la correcta". El veredicto se
     dice con palabras (D17) y la pantalla final no lleva porcentaje, puntaje
     ni proyección (D18, Ley 19.496). El tiempo agotado se informa sin
     dramatismo: es un dato, no un castigo. */
  triage: {
    pill: "Triage",
    sustantivo: "Ítem",
    instruccion: "Lee el ítem y decide. No hay que resolverlo.",
    /* La cuenta regresiva: "Quedan N s". La frase entera va al aria-label; en
       pantalla el número va en `.num` entre las dos palabras. */
    cuenta: (n: number) => `Quedan ${n} s`,
    cuentaAntes: "Quedan",
    cuentaDespues: "s",
    decision: {
      resuelvo: "La resuelvo",
      dejo: "La dejo",
      marco: "La marco y sigo",
      "sin-decision": "Sin decisión",
    },
    veredicto: {
      "lectura-buena": "Lectura buena",
      "lectura-a-revisar": "Lectura a revisar",
      "punto-regalado": "Punto regalado",
      "sin-veredicto": "Sin veredicto",
    },
    /* Pantalla final (D18). Los números van aparte, en `.num`. */
    resultado: {
      titulo: "Sesión terminada",
      decisiones: (n: number) => (n === 1 ? "decisión" : "decisiones"),
      conVeredicto: "con veredicto",
      comoLeiste: "Cómo leíste cada ítem",
      /* Cuando ningún ítem tiene veredicto: dice por qué, sin inventar uno. */
      sinVeredictos:
        "Todavía no hay historial suficiente para dar un veredicto. Haz sesiones de descarte y vuelve.",
      queHacer: "Qué hacer ahora",
      queHacerDetalle:
        "Revisa los ítems marcados como lectura a revisar: el error abierto de cada uno lleva a su repaso.",
      queHacerSinRevisar: "Haz otra sesión: son veinte ítems de la misma unidad, en otro orden.",
      otraSesion: "Otra sesión",
    },
    /* Sin sesión de Clerk. El triage se evalúa contra el historial propio y
       sin cuenta no hay historial. */
    ingresoTitulo: "Ingresa para hacer el triage",
    ingresoCuerpo:
      "El triage se evalúa contra tu propio historial de descarte, que se guarda en tu cuenta. Ingresa y vuelve.",
  },
} as const;
