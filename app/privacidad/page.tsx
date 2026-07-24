import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Qué datos guardamos, para qué, y qué no hacemos con ellos.",
  robots: { index: false, follow: false },
};

const ACTUALIZADO = "23 de julio de 2026";

/** Formulario dedicado a solicitudes de eliminación de datos. */
const URL_ELIMINACION = "https://tally.so/r/Gxj16Q";

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold leading-snug text-ink">{titulo}</h2>
      <div className="mt-3 flex flex-col gap-4 text-base leading-7 text-ink-suave">{children}</div>
    </section>
  );
}

export default function Privacidad() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-24">
      <p className="text-sm uppercase tracking-wide text-ink-suave">
        Actualizado el {ACTUALIZADO}
      </p>
      <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        Aviso de privacidad
      </h1>
      <p className="mt-4 text-lg leading-8 text-ink-suave">
        Esto está escrito para que lo entiendas sin abogado. Si algo no se entiende, es culpa
        nuestra, no tuya.
      </p>

      <Seccion titulo="Si no creas cuenta, no guardamos nada">
        <p>
          Puedes hacer el diagnóstico, las lecciones y el cierre completos sin registrarte. En
          ese caso <strong className="font-medium text-ink">no mandamos nada a ningún servidor</strong>:
          tu avance se queda en tu propio teléfono o computador, dentro del navegador.
        </p>
        <p>
          Eso significa dos cosas. Que nosotros no podemos verlo, ni aunque quisiéramos. Y que si
          borras los datos del navegador, usas modo incógnito o cambias de teléfono, se pierde —
          no hay copia en ninguna parte. Esa es exactamente la razón por la que existe la cuenta.
        </p>
      </Seccion>

      <Seccion titulo="Qué guardamos si creas cuenta">
        <ul className="flex list-disc flex-col gap-3 pl-5 marker:text-border">
          <li>
            <strong className="font-medium text-ink">Tu correo electrónico.</strong> Es lo único
            obligatorio. Lo usamos para enviarte el código con el que entras, y para nada más. No te
            vamos a mandar publicidad.
          </li>
          <li>
            <strong className="font-medium text-ink">Tu nombre, solo si lo escribes.</strong> Es
            opcional y puede ser un apodo. Si lo dejas en blanco, la plataforma funciona igual. Solo
            aparece en tu propia pantalla.
          </li>
          <li>
            <strong className="font-medium text-ink">Tu progreso en las lecciones.</strong> Qué
            lección terminaste, qué respondiste en cada pregunta y cuántos intentos te tomó. Sirve
            para que puedas retomar donde ibas y para que nosotros veamos qué partes están mal
            explicadas.
          </li>
        </ul>
        <p>
          No pedimos tu RUT, tu colegio, tu curso, tu teléfono, tu dirección, tu fecha de nacimiento
          ni una foto. No los pedimos porque no los necesitamos, y lo que no se guarda no se puede
          perder.
        </p>
        <p>
          Tu correo y tu nombre viven en un solo lugar y no se copian a ninguna otra parte. Tu
          progreso se guarda aparte, colgando de un código interno que no dice quién eres.
        </p>
      </Seccion>

      <Seccion titulo="Para qué lo usamos">
        <p>
          Para dos cosas, y podemos nombrarlas las dos: que puedas volver a entrar a tu cuenta, y
          que sepamos si las lecciones enseñan de verdad. Si mucha gente se equivoca en la misma
          pregunta, la pregunta está mal escrita y la arreglamos.
        </p>
        <p>
          Miramos las respuestas de forma agrupada, no persona por persona. Nadie está
          &ldquo;evaluando&rdquo; tu desempeño: no hay nota, ni ranking, ni certificado, ni nada que
          le llegue a tu colegio o a tu apoderado.
        </p>
      </Seccion>

      <Seccion titulo="Con quién lo compartimos">
        <p>
          <strong className="font-medium text-ink">Con nadie.</strong> No vendemos, arrendamos ni
          entregamos tus datos a terceros. No hay publicidad en la plataforma, así que no hay a
          quién vendérselos.
        </p>
        <p>
          Sí usamos tres servicios externos para que la plataforma funcione, y es justo que sepas
          cuáles: <strong className="font-medium text-ink">Clerk</strong> guarda tu correo y tu
          nombre para manejar el inicio de sesión,{" "}
          <strong className="font-medium text-ink">Neon</strong> aloja la base de datos donde queda
          tu progreso, y <strong className="font-medium text-ink">PostHog</strong> registra qué
          pasos de la lección se usan más. Los eventos que le mandamos a PostHog son anónimos: no
          incluyen tu correo, tu nombre ni tu identificador de cuenta, y no dejan cookies en tu
          navegador. Los tres servicios alojan la información en servidores de Estados Unidos.
        </p>
      </Seccion>

      <Seccion titulo="Lo de los 16 años">
        <p>
          Al registrarte marcas una casilla que dice que tienes 16 años o más. No tenemos forma de
          comprobarlo y no lo intentamos: es una declaración tuya, y así hay que entenderla.
        </p>
        <p>
          Decimos esto en voz alta porque preferimos ser honestos sobre lo que esa casilla es —una
          pregunta— antes que hacerla pasar por una verificación que no existe.
        </p>
        <p>
          Si tienes menos de 16, no crees una cuenta sin que un adulto te acompañe. Las lecciones
          siguen estando abiertas para ti sin registrarte.
        </p>
      </Seccion>

      <Seccion titulo="Cómo borras todo">
        <p>
          Pídelo por{" "}
          <a
            href={URL_ELIMINACION}
            className="font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte"
          >
            este formulario
          </a>
          . No hay que justificar el motivo y no vamos a insistir para que te quedes.
        </p>
        <p>
          Qué pasa cuando lo pides: borramos tu cuenta, tu correo y tu nombre. Lo que respondiste en
          las lecciones se queda, pero desconectado de ti — pasa a colgar de un código sin dueño,
          que ya no permite saber quién eras.
        </p>
        <p>
          Queda una sola cosa más, y preferimos decirlo: un registro de qué acceso se te dio y
          cuándo. No contiene tu correo ni tu nombre. Existe para poder responder con certeza si
          alguna vez hay una discusión sobre un pago, y justamente por eso está hecho para no poder
          editarse ni borrarse.
        </p>
      </Seccion>

      <Seccion titulo="En qué etapa está este proyecto">
        <p>
          Esto es un piloto privado. Todavía estamos en proceso de formalización legal: no hay
          sociedad constituida, no cobramos nada y la revisión de un abogado o abogada está
          pendiente. Cuando eso cambie, este aviso se actualiza antes, no después.
        </p>
        <p>
          Mientras tanto, la regla que seguimos es simple: pedir la menor cantidad de datos que
          permita que la plataforma funcione, y no ocupar ninguno para algo que no esté escrito acá.
        </p>
      </Seccion>

      <div className="mt-14 border-t border-border pt-6">
        <Link
          href="/"
          className="text-base font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
