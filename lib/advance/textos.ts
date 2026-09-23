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

  /* Figuras de función (docs/fobos-advance.md §12). El <title> corto del SVG
     dice qué clase de gráfico es; el <desc> es la descripcion del banco. */
  figura: {
    planoUnaCurva: "Gráfico de una función",
    planoVariasCurvas: (n: number) => `Gráfico de ${n === 2 ? "dos" : "tres"} funciones`,
    tabla: "Tabla de valores",
    /* Figuras de datos: el aria-label se genera desde los datos en
       lib/advance/figurasDatos.ts y empieza con una de estas cabezas. */
    tablaDatos: "Tabla de datos",
    barras: "Gráfico de barras",
    histograma: "Histograma",
    lineas: "Gráfico de líneas",
    circular: "Gráfico circular",
    /* <title> del diagrama de cajón; el <desc> es la descripcion del banco. */
    cajon: (n: number) => (n === 1 ? "Diagrama de cajón" : `${["", "", "Dos", "Tres", "Cuatro", "Cinco"][n]} diagramas de cajón`),
    /* <title> del lienzo geométrico; el <desc> es la descripcion del banco. La
       nota va escrita bajo la figura y en el <title> cuando aEscala es false. */
    lienzo: "Figura geométrica",
    noAEscala: "Figura referencial, no está a escala",
    /* Nombre de una serie sin nombre (solo existe con una serie). */
    serieUnica: "Valores",
    porCategoria: (y: string, x: string) => `${y} por ${x}`,
    intervalo: (desde: string, hasta: string) => `de ${desde} a ${hasta}`,
    total: (n: string) => `total ${n}`,
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
    /* Prefijo del estado anunciado por texto: "Descartada: Suma denominadores". */
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

  /* Triage de 20 segundos (docs/fobos-advance.md §6.5, F5a, copy de F5a2).
     Se muestra un ítem, corre una cuenta de 20 s y el estudiante decide; no
     resuelve nada. Las dos decisiones pesan igual: ninguna es "la correcta".
     El veredicto es un rótulo más una explicación (D17) y la pantalla final
     no lleva porcentaje ni proyección (D18, Ley 19.496). El tiempo agotado se
     informa sin dramatismo: es un dato, no un castigo. F5a2 explica lo que
     F5a daba por sabido: qué son "los errores" (vienen del descarte, no del
     triage) y que el triage no juzga, muestra dónde se puede ir el tiempo. */
  triage: {
    pill: "Triage",
    sustantivo: "Ítem",
    /* Texto firmado (F5a2). Va en el primer ítem, encima de la cuenta. */
    instruccion:
      "No tienes que resolver nada. Solo decidir en 20 segundos si le dedicarías tiempo a esta pregunta en la prueba o si la marcarías para volver después.",
    /* Los ítems 2 en adelante llevan la versión corta, en el mismo lugar:
       quien entra a mitad de sesión la sigue viendo sin perder los 20 s. */
    instruccionCorta: "No hay que resolver nada: decide si le dedicarías tiempo o si pasas a la siguiente.",
    /* La cuenta regresiva: "Quedan N s". La frase entera va al aria-label; en
       pantalla el número va en `.num` entre las dos palabras. */
    cuenta: (n: number) => `Quedan ${n} s`,
    cuentaAntes: "Quedan",
    cuentaDespues: "s",
    /* Dos botones desde F5a2: resuelvo y marco. `dejo` fue "La dejo" en F5a
       y quedó sin emisor; se conserva porque el tipo `Decision` la exige y
       una fila vieja podría llegar a esta tabla. `sin-decision` es el tiempo
       agotado y se dice así, sin más. */
    decision: {
      resuelvo: "La resuelvo",
      dejo: "La dejo",
      marco: "Paso a la siguiente",
      "sin-decision": "Se acabó el tiempo",
    },
    /* Rótulo del veredicto (F5a2, textos firmados): en negrita en la fila. */
    veredicto: {
      "lectura-buena": "Buena lectura",
      "lectura-a-revisar": "Ojo con el tiempo",
      "punto-regalado": "Podías con esta",
      "sin-veredicto": "Todavía sin datos",
    },
    /* Explicación del veredicto (F5a2, textos firmados): debajo del rótulo,
       en cuerpo-s. */
    explicacion: {
      "lectura-buena": "Tu decisión calza con lo que ya sabes hacer.",
      "lectura-a-revisar":
        "Esta pregunta se apoya en un procedimiento que todavía estás afinando. Decidir resolverla no está mal, pero en la prueba real es donde se te pueden ir varios minutos.",
      "punto-regalado":
        "Solo usa procedimientos que ya dominas. Volver después te cuesta tiempo que no necesitabas gastar.",
      "sin-veredicto":
        "Necesitamos más sesiones de descarte en este contenido para decirte algo útil.",
    },
    /* Pantalla final (D18). Los números van aparte, en `.num`. */
    resultado: {
      titulo: "Sesión terminada",
      decisiones: (n: number) => (n === 1 ? "decisión" : "decisiones"),
      conVeredicto: "con comentario",
      comoLeiste: "Cómo leíste cada ítem",
      /* Cuando ningún ítem tiene veredicto: dice por qué, sin inventar uno. */
      sinVeredictos:
        "Todavía no tenemos sesiones de descarte tuyas en este contenido. Haz algunas y vuelve: ahí podremos decirte dónde se te puede ir el tiempo.",
      queHacer: "Qué hacer ahora",
      queHacerDetalle:
        "Revisa los ítems que dicen Ojo con el tiempo: la tarjeta de cada uno lleva al repaso del procedimiento que estás afinando.",
      queHacerSinRevisar: "Haz otra sesión: son veinte ítems de la misma unidad, en otro orden.",
      otraSesion: "Otra sesión",
      /* Nota fija al pie (F5a2, texto firmado): siempre visible. */
      nota: "Lo que aquí llamamos errores viene de tus sesiones de descarte, no de lo que decidiste recién. En el triage no hay respuestas buenas ni malas: solo te mostramos dónde se te puede ir el tiempo en la prueba.",
    },
    /* Sin sesión de Clerk. El triage se lee contra el historial propio y sin
       cuenta no hay historial. */
    ingresoTitulo: "Ingresa para hacer el triage",
    ingresoCuerpo:
      "El triage se lee contra tus sesiones de descarte, que se guardan en tu cuenta. Ingresa y vuelve.",
  },

  /* Panel 2×2 (docs/fobos-advance.md §6.2, F4 4.1). Sin llamador en
     producción: requiere modo clásico y solo lo monta /_design. Los rótulos
     de los cuadrantes y de los ejes son los de la tabla de §6.2, tal cual; la
     explicación de cada cuadrante parafrasea el mismo párrafo. El estado sin
     clasificar dice cuántos intentos faltan: la regla de honestidad de §6.2
     se muestra, no se esconde. */
  panel: {
    habilidad: {
      resolver: "Resolver",
      modelar: "Modelar",
      representar: "Representar",
      argumentar: "Argumentar",
    },
    columna: {
      dentro: "Dentro del tiempo",
      sobre: "Sobre el tiempo",
    },
    fila: {
      correcto: "Correcto",
      incorrecto: "Incorrecto",
    },
    cuadrante: {
      dominado: "Dominado",
      fragil: "Frágil",
      "error-conceptual": "Error conceptual",
      bloqueo: "Bloqueo",
    },
    explicacion: {
      dominado: "Correcto y a tiempo.",
      fragil: "Correcto pero lento. En la prueba, con el reloj encima, esto es lo que se cae.",
      "error-conceptual": "Incorrecto y rápido. Se respondió con seguridad y estaba mal: el error que no se nota.",
      bloqueo: "Incorrecto y lento. Sin procedimiento para esto todavía.",
    },
    predomina: "Predomina",
    intentos: (n: number) => (n === 1 ? "intento" : "intentos"),
    /* Menos de `MINIMO_INTENTOS` en la habilidad: no se clasifica nada. */
    sinClasificar: (n: number, minimo: number) =>
      `Todavía sin clasificar: ${n} de ${minimo} intentos necesarios.`,
  },
} as const;
