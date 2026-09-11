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
    /* Con al menos un banco: una sesión de descarte por unidad. */
    conBancos: "Entrenamiento de descarte, cinco ítems por sesión.",
    sesion: (unidad: string) => `Descarte: ${unidad}`,
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
} as const;
