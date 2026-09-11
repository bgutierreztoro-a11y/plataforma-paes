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
  },
} as const;
